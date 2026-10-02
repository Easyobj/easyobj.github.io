# ABB2026 ThinkPHP compatibility changes

Based on the ThinkPHP 3.2.3 bundle in the 2025 activity. Original copyright and Apache 2.0 license notices are retained. `Library/Vendor` (unused historical SDKs) and all old application configuration/runtime files are not copied.

Modified 2026-10-02 for PHP 8 compatibility:

- `Common/functions.php`, `Mode/Api/functions.php`, `Mode/Lite/functions.php`: canonical scalar casts; remove illegal reference assignment to `$GLOBALS` in alternate modes.
- `Library/Behavior/FireShowPageTraceBehavior.class.php`, `Library/Org/Util/IP.class.php`, `Library/Think/Cache/Driver/File.class.php`, `Library/Think/Crypt/Driver/Des.class.php`, `Library/Think/Image/Driver/GIF.class.php`, `Library/Think/Model/AdvModel.class.php`: bracket string offsets replacing removed curly-brace syntax.
- `Library/Think/Db/Driver/Oracle.class.php`, `Library/Think/Upload/Driver/Bcs/bcs.class.php`, `Library/Think/Upload/Driver/Bcs/requestcore.class.php`: canonical scalar casts.
- `Library/Think/Template.class.php`: remove ineffective optional parameter before required parameter.
- `Library/Org/Util/String.class.php` renamed to `LegacyString.class.php` with class `LegacyString`: `String` is reserved in modern PHP; also correct parameter declaration. This utility is not used by this activity.
- `Library/Think/Think.class.php`: safely handle missing exception trace entry; return 500 for application exceptions and log only class/location, not potentially secret-bearing exception messages.

All PHP files are syntax-checked on PHP 8.5. Project HTTP flows are tested; optional old drivers/modes are not comprehensively tested or enabled. These compatibility changes do not constitute a full security audit of the historical framework. The application restricts dispatch to four explicit actions before booting the framework and disables debug/trace and web access to framework/application sources.
