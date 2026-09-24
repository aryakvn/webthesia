import Capacitor
import CoreMIDI

// Native MIDI input for the iOS app: WKWebView has no WebMIDI. Connects every CoreMIDI
// source (hot-plug aware) and forwards MIDI 1.0 channel messages as "midi" events and
// the source list as "devices" events (see src/composables/useNativeMidi.js).
// ponytail: Bluetooth MIDI shows up only once paired elsewhere (e.g. GarageBand);
// in-app pairing needs CABTMIDICentralViewController.
@objc(NativeMidiPlugin)
public class NativeMidiPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NativeMidiPlugin"
    public let jsName = "NativeMidi"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
    ]

    private var client = MIDIClientRef()
    private var port = MIDIPortRef()
    private var connected = Set<MIDIEndpointRef>()

    // UMP message size in 32-bit words, indexed by message type (top nibble).
    private static let umpWords = [1, 1, 1, 2, 2, 4, 1, 1, 2, 2, 2, 3, 3, 4, 4, 4]

    @objc func start(_ call: CAPPluginCall) {
        // Main thread: CoreMIDI delivers setup notifications on the creating thread's run loop.
        DispatchQueue.main.async {
            if self.client == 0 {
                var status = MIDIClientCreateWithBlock("Webthesia" as CFString, &self.client) { [weak self] note in
                    if note.pointee.messageID == .msgSetupChanged {
                        DispatchQueue.main.async { self?.connectSources() }
                    }
                }
                if status == noErr {
                    status = MIDIInputPortCreateWithProtocol(self.client, "Webthesia In" as CFString, ._1_0, &self.port) {
                        [weak self] list, _ in self?.receive(list)
                    }
                }
                guard status == noErr else {
                    if self.client != 0 { MIDIClientDispose(self.client) }
                    self.client = 0
                    call.reject("CoreMIDI setup failed (\(status))")
                    return
                }
            }
            call.resolve(["devices": self.connectSources()])
        }
    }

    @discardableResult
    private func connectSources() -> [[String: String]] {
        let sources = (0..<MIDIGetNumberOfSources()).map { MIDIGetSource($0) }
        for source in sources where !connected.contains(source) {
            MIDIPortConnectSource(port, source, nil)
        }
        connected = Set(sources) // removed sources are disconnected by CoreMIDI
        let list = sources.map { ["id": String($0), "name": Self.name(of: $0)] }
        notifyListeners("devices", data: ["devices": list])
        return list
    }

    private func receive(_ list: UnsafePointer<MIDIEventList>) {
        for packet in list.unsafeSequence() {
            let count = Int(packet.pointee.wordCount)
            let messages: [[Int]] = withUnsafeBytes(of: packet.pointee.words) { raw in
                let words = raw.bindMemory(to: UInt32.self)
                var out = [[Int]]()
                var i = 0
                while i < count {
                    let word = words[i]
                    let type = Int(word >> 28)
                    if type == 2 { // MIDI 1.0 channel voice: [type|group, status, data1, data2]
                        let status = Int((word >> 16) & 0xFF)
                        let bytes = [status, Int((word >> 8) & 0xFF), Int(word & 0xFF)]
                        out.append(Array(bytes.prefix((status & 0xE0) == 0xC0 ? 2 : 3)))
                    }
                    i += Self.umpWords[type]
                }
                return out
            }
            for data in messages { notifyListeners("midi", data: ["data": data]) }
        }
    }

    private static func name(of endpoint: MIDIEndpointRef) -> String {
        var name: Unmanaged<CFString>?
        MIDIObjectGetStringProperty(endpoint, kMIDIPropertyDisplayName, &name)
        return name?.takeRetainedValue() as String? ?? "MIDI device"
    }
}

// Main.storyboard uses this instead of CAPBridgeViewController so in-app plugins get registered.
class BridgeViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(NativeMidiPlugin())
    }
}
