<?php

/**
 * Plugin Name: A11y Tester
 * Description: A plugin to test accessibility of any page or post.
 * Version: 1.1.0
 * Author: Joe Peterson
 * Author URI: https://joepeterson.work
 */

function enqueue_a11y_scripts($hook)
{
    if ('post.php' === $hook || 'post-new.php' === $hook || is_admin_bar_showing()) {

        // wp_enqueue_script('a11y-init', plugin_dir_url(__FILE__) . 'a11y-init.js', null, null, true);
        wp_enqueue_script('a11y-base', plugin_dir_url(__FILE__) . 'a11y-base.js', null, null, true);

        if ('post.php' === $hook || 'post-new.php' === $hook) {
            wp_enqueue_script('a11y-admin', plugin_dir_url(__FILE__) . 'a11y-admin.js', array('a11y-base'), null, true);
        } else if (is_admin_bar_showing()) {
            wp_enqueue_script('a11y-admin-bar', plugin_dir_url(__FILE__) . 'a11y-admin-bar.js', array('a11y-base'), null, true);
        }

        $nonce = wp_create_nonce('a11y_nonce');
        wp_localize_script('a11y-base', 'wpData', array('ajax_url' => admin_url('admin-ajax.php'), 'nonce' => $nonce));

        $theme_css_path = get_stylesheet_directory() . '/a11y-tester/a11y-styles.css';
        $theme_css_url = get_stylesheet_directory_uri() . '/a11y-tester/a11y-styles.css';
        $plugin_css_url = plugin_dir_url(__FILE__) . 'a11y-styles.css';

        if (file_exists($theme_css_path)) {
            wp_enqueue_style('a11y-style', $theme_css_url, array(), '1.0');
        } else {
            wp_enqueue_style('a11y-style', $plugin_css_url, array(), '1.0');
        }
    }
}
add_action('admin_enqueue_scripts', 'enqueue_a11y_scripts');

function add_a11y_meta_box()
{
    $args = array(
        'public' => true,
    );

    $post_types = get_post_types($args);
    foreach ($post_types as $post_type) {
        add_meta_box('a11y_meta_box', 'Accessibility Tester', 'a11y_meta_box_content', $post_type, 'normal', 'high');
    }
}
add_action('add_meta_boxes', 'add_a11y_meta_box');

function a11y_meta_box_content()
{
    echo '<div class="inside"></div>';
}

add_action('wp_ajax_run_a11y_test', 'run_a11y_test_function');
function run_a11y_test_function()
{
    check_ajax_referer('a11y_nonce', 'security');

    if (!current_user_can('edit_posts')) {
        wp_send_json_error('You do not have the necessary permissions.');
        wp_die();
    }

    $post_id = intval($_POST['post_id']);
    if ($post_id <= 0) {
        wp_send_json_error('Invalid post ID');
        wp_die();
    }

    $post_id = absint($post_id);
    $url = get_permalink($post_id);
    if (!$url) {
        wp_send_json_error('Could not get the permalink');
        wp_die();
    }

    wp_send_json_success(array('url' => $url));
    wp_die();
}

function a11y_custom_plugin_links($links, $file)
{
    if (plugin_basename(__FILE__) === $file) {
        $row_meta = array(
            'source' => '<a href="https://github.com/skullzarmy/a11y-tester-wordpress-plugin" target="_blank" rel="nofollow noopener">Source Code</a>',
            'support' => '<a href="https://github.com/skullzarmy/a11y-tester-wordpress-plugin/issues" target="_blank" rel="nofollow noopener">Support</a>',
        );
        return array_merge($links, $row_meta);
    }
    return (array) $links;
}
add_filter('plugin_row_meta', 'a11y_custom_plugin_links', 10, 2);

function a11y_admin_bar_button()
{
    global $wp_admin_bar;
    $wp_admin_bar->add_menu(array(
        'id' => 'a11y-admin-bar-button',
        'title' => 'A11y Test',
        'href' => '#',
        'onclick' => 'a11yAdminBarClick()',
        'meta' => array(
            'class' => 'a11y-admin-bar-button',
        ),
    ));
}
add_action('admin_bar_menu', 'a11y_admin_bar_button', 999);
