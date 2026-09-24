package com.aryakvn.webthesia;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeMidiPlugin.class); // in-app plugin, must register before super
        super.onCreate(savedInstanceState);
    }
}
