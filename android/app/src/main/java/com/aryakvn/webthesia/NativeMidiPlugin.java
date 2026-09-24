package com.aryakvn.webthesia;

import android.content.Context;
import android.media.midi.MidiDevice;
import android.media.midi.MidiDeviceInfo;
import android.media.midi.MidiManager;
import android.media.midi.MidiOutputPort;
import android.media.midi.MidiReceiver;
import android.os.Handler;
import android.os.Looper;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

// Native MIDI input for the Android app: the WebView has no WebMIDI. Opens every
// connected device (hot-plug aware) and forwards raw bytes as "midi" events and the
// device list as "devices" events. JS splits the bytes (src/composables/useNativeMidi.js).
// ponytail: USB and virtual devices only; Bluetooth MIDI needs a scan + openBluetoothDevice.
@CapacitorPlugin(name = "NativeMidi")
public class NativeMidiPlugin extends Plugin {

    private MidiManager manager;
    private final Handler main = new Handler(Looper.getMainLooper());
    private final Map<Integer, String> names = new ConcurrentHashMap<>(); // device id -> name, opening or open
    private final Map<Integer, MidiDevice> devices = new ConcurrentHashMap<>();

    private final MidiReceiver receiver = new MidiReceiver() {
        @Override
        public void onSend(byte[] msg, int offset, int count, long timestamp) {
            JSArray data = new JSArray();
            for (int i = offset; i < offset + count; i++) data.put(msg[i] & 0xFF);
            JSObject event = new JSObject();
            event.put("data", data);
            notifyListeners("midi", event);
        }
    };

    @PluginMethod
    public void start(PluginCall call) {
        if (manager == null) {
            manager = (MidiManager) getContext().getSystemService(Context.MIDI_SERVICE);
            if (manager == null) {
                call.reject("MIDI is not supported on this device");
                return;
            }
            manager.registerDeviceCallback(new MidiManager.DeviceCallback() {
                @Override
                public void onDeviceAdded(MidiDeviceInfo info) { open(info); }

                @Override
                public void onDeviceRemoved(MidiDeviceInfo info) { close(info.getId()); }
            }, main);
            for (MidiDeviceInfo info : manager.getDevices()) open(info);
        }
        call.resolve(deviceList());
    }

    private void open(MidiDeviceInfo info) {
        int id = info.getId();
        // Output ports are the ones the app reads from; skip output-only gear.
        if (info.getOutputPortCount() == 0 || names.containsKey(id)) return;
        names.put(id, info.getProperties().getString(MidiDeviceInfo.PROPERTY_NAME, "MIDI device " + id));
        manager.openDevice(info, device -> {
            if (device == null) {
                names.remove(id);
            } else if (!names.containsKey(id)) { // unplugged while opening
                closeQuietly(device);
                return;
            } else {
                devices.put(id, device);
                for (MidiDeviceInfo.PortInfo port : info.getPorts()) {
                    if (port.getType() != MidiDeviceInfo.PortInfo.TYPE_OUTPUT) continue;
                    MidiOutputPort out = device.openOutputPort(port.getPortNumber());
                    if (out != null) out.connect(receiver);
                }
            }
            notifyListeners("devices", deviceList());
        }, main);
    }

    private void close(int id) {
        names.remove(id);
        MidiDevice device = devices.remove(id);
        if (device != null) closeQuietly(device);
        notifyListeners("devices", deviceList());
    }

    private static void closeQuietly(MidiDevice device) {
        try {
            device.close();
        } catch (IOException ignored) {}
    }

    private JSObject deviceList() {
        JSArray list = new JSArray();
        for (Map.Entry<Integer, String> e : names.entrySet()) {
            JSObject d = new JSObject();
            d.put("id", String.valueOf(e.getKey()));
            d.put("name", e.getValue());
            list.put(d);
        }
        JSObject result = new JSObject();
        result.put("devices", list);
        return result;
    }

    @Override
    protected void handleOnDestroy() {
        for (MidiDevice device : devices.values()) closeQuietly(device);
        devices.clear();
        names.clear();
    }
}
