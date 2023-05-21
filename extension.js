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
            const appxid = appx.get_id();

            log("appxid : " + appxid);

            let deskapps = Gio.DesktopAppInfo.new(appxid);
            log("deskapps : " + deskapps.get_filename());
            log("deskapps display name : " + deskapps.get_display_name());

            // get_display_name is a function of AppInfo which is DesktopAppInfo inherited

            // log("appx pids: " + appx.get_pids());


            // var y = Shell.AppSystem.get_running();

            // log("running: " + y);

            // let apps = Gio.AppInfo.get_all();
            // apps.forEach(function (w) {
            //     log("app name : " + w.get_display_name());
            //     log("app id : " + w.get_id());
            // })

            let shellapps = Shell.AppSystem.get_default().lookup_app(appxid).get_windows();
            shellapps.forEach(function (w) {
                log("window id : " + w.get_id());
            })

            let runningshellapps = Shell.AppSystem.get_default().get_running();
            runningshellapps.forEach(function (w) {
                log("running app id : " + w.get_id());
            })

            //


            // const filepath = GLib.build_filenamev([GLib.get_home_dir(), 'test-file.txt']);

            // const file = Gio.File.new_for_path(filepath);

            // // const outputStreamCreate = file.create(Gio.FileCreateFlags.NONE, null);
            // const outputStreamAppend = file.append_to(Gio.FileCreateFlags.NONE, null);

            // var to_write = appxid + ' ' + apppid + ' ' + openedfilepath + '\n'

            // const bytesWritten = outputStreamAppend.write_all(to_write, null);
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