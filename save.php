<?php
$dir = dirname(__FILE__);
$content = $_POST['locale'];
$user = isset($_SERVER['PHP_AUTH_USER']) ? $_SERVER['PHP_AUTH_USER'] . '-' : '';
copy($dir . '/locales.js', $dir . '/backup/locales-' . $user . time() . '.js.bak');
file_put_contents($dir . '/locales.js', $content);
echo 'OK';
