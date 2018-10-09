#mysql数据库表结构

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_name` char(50) NOT NULL DEFAULT '' COMMENT '用户帐号',
  `pass_word` char(128) NOT NULL DEFAULT '' COMMENT '用户密码',
  `user_type` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '用户类型 0:未审核用户;1:超级管理员;2:普通管理员;3:VIP用户;4:普通用户',
  `user_email` char(128) NOT NULL DEFAULT '' COMMENT '邮箱地址',
  `create_time` timestamp DEFAULT '0000-00-00 00:00:00' COMMENT '注册时间',
  `login_ip` char(15) NOT NULL DEFAULT '' COMMENT '登录IP',
  `update_time` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE CURRENT_TIMESTAMP COMMENT '最后登录时间',
  `user_pic` varchar(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL DEFAULT '' COMMENT '用户头像',
  `user_extend` text CHARACTER SET utf8 COLLATE utf8_unicode_ci COMMENT '扩展信息',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户据库表';

DROP TABLE IF EXISTS `sort`;
CREATE TABLE `sort` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  `sort_name` char(50) NOT NULL DEFAULT '' COMMENT '分类名称',
  `parent_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '分类父ID',
  `sort_type` char(10) NOT NULL DEFAULT '' COMMENT '分类类别（可定制成新闻、文章、教程等）',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='文章分类表';

DROP TABLE IF EXISTS `article`;
CREATE TABLE `article` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  `sort_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '分类ID',
  `user_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '用户ID',
  `title` char(100) NOT NULL DEFAULT '' COMMENT '文章标题',
  `description` char(255) NOT NULL DEFAULT '' COMMENT '文章描述',
  `thumbnail` char(255) NOT NULL DEFAULT '' COMMENT '缩略图(新增)',
  `content` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL COMMENT '文章内容',
  `passed` int(1) NOT NULL DEFAULT '0' COMMENT '审核状态',
  `read_type` tinyint NOT NULL DEFAULT '0' COMMENT '阅读权限（参阅用户类型）',
  `create_time` TIMESTAMP(6) not NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '发表时间',
  `update_time` TIMESTAMP(6) not NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '修改时间',
  `article_extend` text CHARACTER SET utf8 COLLATE utf8_unicode_ci COMMENT '扩展信息',
  PRIMARY KEY (`id`),
  KEY `sort_id` (`sort_id`) USING BTREE,
  KEY `user_id` (`user_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='文章数据库表';

DROP TABLE IF EXISTS `upload`;
CREATE TABLE `upload` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '用户ID',
  `file_name` char(100) NOT NULL DEFAULT '' COMMENT '文件名称',
  `file_path` char(200) NOT NULL DEFAULT '' COMMENT '文件路径',
  `mime_type` char(50) NOT NULL DEFAULT '' COMMENT '文件类型',
  `file_size` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '文件大小KB',
  `is_delete` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否删除',
  `create_time` timestamp NULL DEFAULT '0000-00-00 00:00:00' COMMENT '上传时间',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='上传列表';

DROP TABLE IF EXISTS `media`;
CREATE TABLE `media` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  `article_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '文章ID',
  `media_name` char(100) NOT NULL DEFAULT '' COMMENT '图片名称',
  `media_src` char(200) NOT NULL DEFAULT '' COMMENT '图片地址',
  `type` char(10) NOT NULL DEFAULT '' COMMENT '分类类别（picture,video,audio）',
  `width` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '宽度',
  `height` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '高度',
  `size` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '大小MB',
  `hits` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '点击量',
  `create_time` timestamp NULL DEFAULT '0000-00-00 00:00:00' COMMENT '添加时间',
  PRIMARY KEY (`id`),
  KEY `article_id` (`article_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='多媒体列表';

DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  `article_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '文章ID',
  `content` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL COMMENT '评论内容',
  `praise` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '赞赏数量',
  `user_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '评论用户ID',
  `to_uid` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '@用户ID',
  `create_time` timestamp NULL DEFAULT '0000-00-00 00:00:00' COMMENT '评论时间',
  PRIMARY KEY (`id`),
  KEY `article_id` (`article_id`) USING BTREE,
  KEY `user_id` (`user_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='评论列表';

INSERT INTO user (user_name,pass_word,user_type,user_email) VALUES ('admin','$2a$10$oe/ovruYdv0EmNsKWLJwfu6Na51whOBRJOAJxBO.yt/C6DxQhdDNK',1,'10000@qq.com');
#可选的操作：插入用户：admin  密码：admin123
