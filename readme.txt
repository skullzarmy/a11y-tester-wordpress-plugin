=== A11y Tester ===
Contributors: joepeterson
Tags: accessibility, a11y, testing, axe-core
Requires at least: 4.7
Tested up to: 5.9
Requires PHP: 7.0
Stable tag: 1.0.5
License: GPLv3 or later
License URI: http://www.gnu.org/licenses/gpl-3.0.html
Author: Joe Peterson
Author URI: https://joepeterson.work

Test accessibility of your WordPress pages and posts right from the admin dashboard!

== Description ==

The A11y Tester WordPress plugin aims to make accessibility testing seamless and integrated into the WordPress ecosystem. Utilizing the power of the axe-core library, this plugin enables you to conduct accessibility tests on your WordPress pages and posts directly from the admin dashboard. Ensure your content is accessible to all, including those using assistive technologies, with just the click of a button.

== Installation ==

= From WordPress Plugin Repository (Not yet available) =

1. Go to 'Plugins' > 'Add New' in your WordPress dashboard.
2. Search for 'A11y Tester'.
3. Click 'Install Now' and then 'Activate'.

= Manual Installation =

1. Download the plugin files.
2. Upload the plugin files to the /wp-content/plugins/a11y-tester directory, or install the plugin through the WordPress plugins screen directly.
3. Activate the plugin through the 'Plugins' screen in WordPress.

== Frequently Asked Questions ==

= Does this plugin work with all themes and plugins? =

While A11y Tester aims to be as compatible as possible with other themes and plugins, there may be some cases where conflicts arise. If you encounter issues, please report them in the GitHub repository.

== Usage ==

1. Edit Post/Page: Navigate to the post or page you want to test.
2. Find A11y Tester Meta Box: Scroll down to find the 'A11y Tester' meta box.
3. Run Test: Click the 'Run A11y Test' button to start the accessibility test.
4. View Results: The test results will be displayed within the meta box. Issues are categorized by impact severity.
5. Clear Results: Click 'Clear A11y Test' to remove the results.

= Summary Table =
Starting from version 1.0.4, a summary table is added to the results for a more comprehensive view of the test outcome.

== Customization ==

The plugin comes with a predefined set of CSS styles to make the results readable and organized. Starting from version 1.0.3, you can override the default styles by placing a customized `a11y-styles.css` file in the following directory structure:

- wp-content
    - themes
        - your-active-theme
            - a11y-tester
                - a11y-styles.css

== Screenshots ==

1. A11y Tester Meta Box on the post edit screen.
2. Test results displayed in the Meta Box.
3. A11y Tester settings page.

== Upgrade Notice ==

= 1.0 =
Initial release, no upgrades required.

= 1.0.1 =
* Added misc security enhancements.
* Fixed AJAX issues.

= 1.0.2 =
* Added formatting improvements to the result report.

= 1.0.3 =
* Added support for overriding styles via theme directory.

= 1.0.4 =
* Refactored the axe test to use a temporary iframe.
* Added a summary table to the test results.

= 1.0.5 =
* Restyled results summary and table

= 1.0.6 =
* Implemented iframe scoping to securely run accessibility tests.
* Enhanced performance and security by refactoring the iframe generation and execution code.


== License ==

This WordPress Plugin is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 2 of the License or any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

== Contributions ==

Contributions, issues, and feature requests are welcome! For support, visit the [A11y Tester WordPress plugin GitHub repository](https://github.com/skullzarmy/a11y-tester-wordpress-plugin) and [submit an issue](https://github.com/skullzarmy/a11y-tester-wordpress-plugin/issues).

== Changelog ==

= 1.0.6 =
* Implemented iframe scoping to securely run accessibility tests.
* Enhanced performance and security by refactoring the iframe generation and execution code.

= 1.0.5 =
* Restyled results summary and table.

= 1.0.4 =
* Refactored the axe test to use a temporary iframe.
* Added a summary table to the test results.

= 1.0.3 =
* Added support for overriding styles via theme directory.

= 1.0.2 =
* Added formatting improvements to the result report.

= 1.0.1 =
* Added misc security enhancements.
* Fixed AJAX issues.

= 1.0 =
* Initial release
