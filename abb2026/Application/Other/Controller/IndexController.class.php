<?php
namespace Other\Controller;

use Think\Controller;

final class IndexController extends Controller
{
    public function index(): void
    {
        $page = \PageController::handle();
        defined('ABB_TEMPLATE_RENDER') || define('ABB_TEMPLATE_RENDER', true);
        if (($page['view'] ?? '') === 'wechat-required') {
            $this->display('wechat-required');
            return;
        }
        $this->assign('serverState', $page['serverState']);
        $this->display('activity');
    }
}
