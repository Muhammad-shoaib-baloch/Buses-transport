<?php

/*
 * Router for PHP's built-in server during local development:
 *   php -d extension=gd -S 127.0.0.1:8000 -t public dev-server.php
 * Static files in public/ are served directly; everything else goes to Laravel.
 */
$public = __DIR__.'/public';
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '');

if ($uri !== '/' && is_file($public.$uri)) {
    return false;
}

require_once $public.'/index.php';
