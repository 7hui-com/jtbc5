<?php
chdir(__DIR__);
define('JTBC_RUNDIR', basename(__DIR__));
require_once('../Bootstrap/jtbc.php');
Jtbc\Router\AutoRouter::run();