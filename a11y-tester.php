<?php

/**
 * Plugin Name: A11y Tester
 * Description: A plugin to test accessibility of any page or post.
 * Version: 1.0
 * Author: Joe Peterson
 * Author URI: https://joepeterson.work
 */

function enqueue_a11y_scripts()
{
    if (is_admin()) {
        wp_enqueue_script('axe-core', 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.8.2/axe.min.js', array(), '4.8.2', true);
        wp_enqueue_script('a11y-init', plugin_dir_url(__FILE__) . 'a11y-init.js', array('axe-core'), '1.0', true);
        wp_localize_script('a11y-init', 'wpData', array('ajax_url' => admin_url('admin-ajax.php')));
        wp_enqueue_style('a11y-style', plugin_dir_url(__FILE__) . 'a11y-styles.css', array(), '1.0');
    }
}
add_action('admin_enqueue_scripts', 'enqueue_a11y_scripts');

// Add meta box
function add_a11y_meta_box()
{
    add_meta_box('a11y_meta_box', 'Accessibility Tester', 'a11y_meta_box_content', array('post', 'page'), 'normal', 'high');
}
add_action('add_meta_boxes', 'add_a11y_meta_box');

// Meta box content
function a11y_meta_box_content()
{
    echo '<div class="inside"></div>';
}

// AJAX handler
add_action('wp_ajax_run_a11y_test', 'run_a11y_test_function');

function run_a11y_test_function()
{
    $post_id = $_POST['post_id'];
    $url = get_permalink($post_id);
    wp_send_json(array('url' => $url));
    wp_die();
}

function a11y_custom_plugin_links($links, $file)
{

    // Check if this is your plugin. If not, return the default links array.
    if (plugin_basename(__FILE__) === $file) {
        // You can make the links open in a new tab by adding target='_blank' to the anchor tags.
        $row_meta = array(
            'source' => '<a href="https://github.com/skullzarmy/a11y-tester-wordpress-plugin" target="_blank" rel="nofollow noopener">Source Code</a>',
            'support' => '<a href="https://github.com/skullzarmy/a11y-tester-wordpress-plugin/issues" target="_blank" rel="nofollow noopener">Support</a>',
        );

        // Merge our new links with the default links.
        return array_merge($links, $row_meta);
    }

    return (array) $links;
}
add_filter('plugin_row_meta', 'a11y_custom_plugin_links', 10, 2);
