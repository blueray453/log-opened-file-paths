const { Gio, GLib, Shell } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const connection = Gio.DBus.session;
var handlerId;

class Extension {
    constructor() {
    }

    enable() {

        handlerId = connection.signal_subscribe(null, "org.gtk.gio.DesktopAppInfo", "Launched", "/org/gtk/gio/DesktopAppInfo", null, 0, _parseSignal);

        function _parseSignal(connection, sender, path, iface, signal, params) {
            log("Calling _parseSignal");

            var apppath = params.get_child_value(0).get_bytestring();
            var apppid = params.get_child_value(2).get_int64();
            var openedfilepath = params.get_child_value(3).get_strv();

            log("apppath : " + apppath);
            // log("apppath type : " + typeof apppath);
            log("openedfilepath : " + openedfilepath);
            log("apppid : " + apppid);

            const appx = Gio.DesktopAppInfo.new_from_filename(String.fromCharCode(...apppath));
            const appxid = Gio.DesktopAppInfo.new_from_filename(String.fromCharCode(...apppath)).get_id();

            // log("appxid : " + appxid);
            // log("appx pids: " + appxid.get_pids());

            // log("appx : " + TextDecoder.decode(apppath, true));
            // log("appx : " + TextDecoder.decode(apppath, false));

            const filepath = GLib.build_filenamev([GLib.get_home_dir(), 'test-file.txt']);

            const file = Gio.File.new_for_path(filepath);

            // const outputStreamCreate = file.create(Gio.FileCreateFlags.NONE, null);
            const outputStreamAppend = file.append_to(Gio.FileCreateFlags.NONE, null);

            var to_write = appxid + ' ' + apppid + ' ' + openedfilepath + '\n'

            const bytesWritten = outputStreamAppend.write_all(to_write, null);
        }
    }

    disable() {
        connection.signal_unsubscribe(handlerId);
        log(`disabling ${Me.metadata.name}`);
    }
}

function init() {
    log(`initializing ${Me.metadata.name}`);

    return new Extension();
}