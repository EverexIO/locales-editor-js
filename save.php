<?php
$dir = dirname(__FILE__);

// Save locale file
if(isset($_POST['locale'])){
    $content = $_POST['locale'];
    $user = isset($_SERVER['PHP_AUTH_USER']) ? $_SERVER['PHP_AUTH_USER'] . '-' : '';
    copy($dir . '/locales.js', $dir . '/backup/locales-' . $user . time() . '.js.bak');
    file_put_contents($dir . '/locales.js', $content);
}

// Save changes
if(isset($_POST['changes'])){
    $content = $_POST['changes'];
    file_put_contents($dir . '/locales-changes.js', $content);
}

echo 'OK';
