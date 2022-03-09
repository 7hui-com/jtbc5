SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for aboutus
-- ----------------------------
DROP TABLE IF EXISTS `aboutus`;
CREATE TABLE `aboutus`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '{\"mode\":\"auto\"}',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"type\":\"text\"}',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '{\"type\":\"editor\",\"required\":false}',
  `attachment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '{\"type\":\"attachment\",\"required\":false,\"has_upload\":true,\"extra\":{\"partner\":\"content\"}}',
  `order` int(11) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"int\"}',
  `time` datetime(0) NULL DEFAULT NULL COMMENT '{\"type\":\"datetime\",\"format\":\"datetime\",\"hidden\":[\"add\"]}',
  `lang` tinyint(4) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"int\"}',
  `published` tinyint(4) NULL DEFAULT 0 COMMENT '{\"type\":\"switch\",\"required\":false,\"format\":\"int\"}',
  `deleted` tinyint(4) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"int\"}',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `a_delete`(`deleted`, `lang`, `published`) USING BTREE,
  INDEX `a_time`(`time`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of aboutus
-- ----------------------------
INSERT INTO `aboutus` VALUES (1, '公司简介', '<p></p>', '', 0, '2021-12-31 0:00:00', 0, 1, 0);

-- ----------------------------
-- Table structure for console_account
-- ----------------------------
DROP TABLE IF EXISTS `console_account`;
CREATE TABLE `console_account`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '{\"mode\":\"auto\"}',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"format\":\"name\"}',
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"mode\":\"manual\",\"required\":false}',
  `role` int(11) NULL DEFAULT 0 COMMENT '{\"format\":\"int\"}',
  `email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"format\":\"email\",\"required\":false}',
  `mobile` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"format\":\"mobile\",\"required\":false}',
  `last_ip` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"mode\":\"manual\",\"required\":false}',
  `last_time` datetime(0) NULL DEFAULT NULL COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"datetime\"}',
  `last_date` int(11) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"int\"}',
  `last_error_count` int(11) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"int\"}',
  `time` datetime(0) NULL DEFAULT NULL COMMENT '{\"format\":\"datetime\"}',
  `locked` tinyint(4) NULL DEFAULT 0 COMMENT '{\"format\":\"int\"}',
  `deleted` tinyint(4) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"int\"}',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username`) USING BTREE,
  INDEX `deleted`(`deleted`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of console_account
-- ----------------------------
INSERT INTO `console_account` VALUES (1, '{$console_account_username}', '{$console_account_password}', -1, NULL, '{$console_account_mobile}', NULL, NULL, 0, 0, '{$console_account_time}', 0, 0);

-- ----------------------------
-- Table structure for console_cloud-detect
-- ----------------------------
DROP TABLE IF EXISTS `console_cloud-detect`;
CREATE TABLE `console_cloud-detect`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `appid` int(11) NULL DEFAULT 0,
  `kernel_detected_at` int(11) NULL DEFAULT 0,
  `package_detected_at` int(11) NULL DEFAULT 0,
  `has_new_version_for_kernel` int(11) NULL DEFAULT 0,
  `has_new_version_for_package` int(11) NULL DEFAULT 0,
  `deleted` tinyint(4) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `appid`(`appid`) USING BTREE,
  INDEX `deleted`(`deleted`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for console_cloud-migrate
-- ----------------------------
DROP TABLE IF EXISTS `console_cloud-migrate`;
CREATE TABLE `console_cloud-migrate`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mode` int(11) NULL DEFAULT 0,
  `genre` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '0',
  `type_id` int(11) NULL DEFAULT 0,
  `version` int(11) NULL DEFAULT 0,
  `target_version` int(11) NULL DEFAULT 0,
  `status` int(11) NULL DEFAULT 0,
  `timestamp` int(11) NULL DEFAULT 0,
  `deleted` tinyint(4) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `deleted`(`deleted`) USING BTREE,
  INDEX `server_id`(`type`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for console_log
-- ----------------------------
DROP TABLE IF EXISTS `console_log`;
CREATE TABLE `console_log`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '{\"manual\":\"true\"}',
  `genre` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `content` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `userip` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `account_id` int(200) NULL DEFAULT 0,
  `time` datetime(0) NULL DEFAULT NULL,
  `deleted` tinyint(4) NULL DEFAULT 0 COMMENT '{\"manual\":\"true\"}',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `deleted`(`deleted`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for console_role
-- ----------------------------
DROP TABLE IF EXISTS `console_role`;
CREATE TABLE `console_role`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '{\"mode\":\"auto\"}',
  `title` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `permission` varchar(10000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `lang` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `time` datetime(0) NULL DEFAULT NULL COMMENT '{\"format\":\"datetime\"}',
  `order` int(11) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"int\"}',
  `deleted` tinyint(4) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"int\"}',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `deleted`(`deleted`) USING BTREE,
  INDEX `order`(`order`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for news
-- ----------------------------
DROP TABLE IF EXISTS `news`;
CREATE TABLE `news`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '{\"mode\":\"auto\"}',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"type\":\"text\"}',
  `category` int(11) NULL DEFAULT 0 COMMENT '{\"type\":\"select\",\"format\":\"int\",\"locked\":true}',
  `image` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"type\":\"upload\",\"required\":false,\"has_upload\":true}',
  `summary` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"type\":\"textarea\",\"required\":false}',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '{\"type\":\"editor\",\"required\":false}',
  `attachment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '{\"type\":\"attachment\",\"required\":false,\"has_upload\":true,\"extra\":{\"partner\":\"content\"}}',
  `time` datetime(0) NULL DEFAULT NULL COMMENT '{\"type\":\"datetime\",\"format\":\"datetime\",\"hidden\":[\"add\"]}',
  `lang` tinyint(4) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"int\"}',
  `published` tinyint(4) NULL DEFAULT 0 COMMENT '{\"type\":\"switch\",\"required\":false,\"format\":\"int\"}',
  `deleted` tinyint(4) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"int\"}',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `a_delete`(`deleted`, `lang`, `published`) USING BTREE,
  INDEX `a_time`(`time`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for partnership
-- ----------------------------
DROP TABLE IF EXISTS `partnership`;
CREATE TABLE `partnership`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '{\"mode\":\"auto\"}',
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"type\":\"text\"}',
  `logo` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"type\":\"upload\",\"has_upload\":true}',
  `order` int(11) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"int\"}',
  `time` datetime(0) NULL DEFAULT NULL COMMENT '{\"type\":\"datetime\",\"format\":\"datetime\",\"hidden\":[\"add\"]}',
  `lang` tinyint(4) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"int\"}',
  `published` tinyint(4) NULL DEFAULT 0 COMMENT '{\"type\":\"switch\",\"required\":false,\"format\":\"int\"}',
  `deleted` tinyint(4) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"int\"}',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `a_delete`(`deleted`, `lang`, `published`) USING BTREE,
  INDEX `a_time`(`time`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for product
-- ----------------------------
DROP TABLE IF EXISTS `product`;
CREATE TABLE `product`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '{\"mode\":\"auto\"}',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"type\":\"text\"}',
  `category` int(11) NULL DEFAULT 0 COMMENT '{\"type\":\"select\",\"format\":\"int\",\"locked\":true}',
  `image` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"type\":\"upload\",\"has_upload\":true}',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '{\"type\":\"editor\",\"required\":false}',
  `attachment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '{\"type\":\"attachment\",\"required\":false,\"has_upload\":true,\"extra\":{\"partner\":\"content\"}}',
  `time` datetime(0) NULL DEFAULT NULL COMMENT '{\"type\":\"datetime\",\"format\":\"datetime\",\"hidden\":[\"add\"]}',
  `lang` tinyint(4) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"int\"}',
  `published` tinyint(4) NULL DEFAULT 0 COMMENT '{\"type\":\"switch\",\"required\":false,\"format\":\"int\"}',
  `deleted` tinyint(4) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"int\"}',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `a_delete`(`deleted`, `lang`, `published`) USING BTREE,
  INDEX `a_time`(`time`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for recruitment
-- ----------------------------
DROP TABLE IF EXISTS `recruitment`;
CREATE TABLE `recruitment`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '{\"mode\":\"auto\"}',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"type\":\"text\"}',
  `email` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"type\":\"text\",\"format\":\"email\"}',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '{\"type\":\"editor\",\"required\":false}',
  `attachment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '{\"type\":\"attachment\",\"required\":false,\"has_upload\":true,\"extra\":{\"partner\":\"content\"}}',
  `time` datetime(0) NULL DEFAULT NULL COMMENT '{\"type\":\"datetime\",\"format\":\"datetime\",\"hidden\":[\"add\"]}',
  `lang` tinyint(4) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"int\"}',
  `published` tinyint(4) NULL DEFAULT 0 COMMENT '{\"type\":\"switch\",\"required\":false,\"format\":\"int\"}',
  `deleted` tinyint(4) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"int\"}',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `a_delete`(`deleted`, `lang`, `published`) USING BTREE,
  INDEX `a_time`(`time`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for team
-- ----------------------------
DROP TABLE IF EXISTS `team`;
CREATE TABLE `team`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '{\"mode\":\"auto\"}',
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"type\":\"text\"}',
  `position` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"type\":\"text\"}',
  `avatar` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"type\":\"avatar\"}',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '{\"type\":\"editor\",\"required\":false}',
  `attachment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '{\"type\":\"attachment\",\"required\":false,\"has_upload\":true,\"extra\":{\"partner\":\"content\"}}',
  `order` int(11) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"int\"}',
  `time` datetime(0) NULL DEFAULT NULL COMMENT '{\"type\":\"datetime\",\"format\":\"datetime\",\"hidden\":[\"add\"]}',
  `lang` tinyint(4) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"int\"}',
  `published` tinyint(4) NULL DEFAULT 0 COMMENT '{\"type\":\"switch\",\"required\":false,\"format\":\"int\"}',
  `deleted` tinyint(4) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"int\"}',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `a_delete`(`deleted`, `lang`, `published`) USING BTREE,
  INDEX `a_time`(`time`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for universal_captcha
-- ----------------------------
DROP TABLE IF EXISTS `universal_captcha`;
CREATE TABLE `universal_captcha`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '{\"mode\":\"auto\"}',
  `code` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `timestamp` int(11) NULL DEFAULT 0,
  `used` tinyint(4) NULL DEFAULT 0,
  `deleted` tinyint(4) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\"}',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `deleted`(`deleted`) USING BTREE,
  INDEX `used`(`used`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for universal_category
-- ----------------------------
DROP TABLE IF EXISTS `universal_category`;
CREATE TABLE `universal_category`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '{\"mode\":\"auto\"}',
  `father_id` int(11) NULL DEFAULT 0 COMMENT '{\"required\":false,\"format\":\"int\"}',
  `title` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `image` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"required\":false,\"has_upload\":true}',
  `keywords` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"required\":false}',
  `intro` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"required\":false}',
  `genre` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"required\":false}',
  `order` int(11) NULL DEFAULT 0 COMMENT '{\"required\":false,\"format\":\"int\"}',
  `time` datetime NULL DEFAULT NULL COMMENT '{\"format\":\"datetime\"}',
  `lang` tinyint(4) NULL DEFAULT 0 COMMENT '{\"required\":false,\"format\":\"int\"}',
  `published` tinyint(4) NULL DEFAULT 0 COMMENT '{\"required\":false,\"format\":\"int\"}',
  `deleted` tinyint(4) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"int\"}',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `deleted`(`deleted`) USING BTREE,
  INDEX `genre`(`genre`, `published`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for universal_dictionary
-- ----------------------------
DROP TABLE IF EXISTS `universal_dictionary`;
CREATE TABLE `universal_dictionary`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '{\"mode\":\"auto\"}',
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"format\":\"natural\"}',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '{\"format\":\"json\",\"required\":false}',
  `time` datetime(0) NULL DEFAULT NULL COMMENT '{\"format\":\"datetime\"}',
  `deleted` tinyint(4) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"int\"}',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `name`(`name`) USING BTREE,
  INDEX `deleted`(`deleted`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for universal_fragment
-- ----------------------------
DROP TABLE IF EXISTS `universal_fragment`;
CREATE TABLE `universal_fragment`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '{\"mode\":\"auto\"}',
  `key` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"format\":\"natural\"}',
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"required\":false}',
  `mode` tinyint(4) NULL DEFAULT 0 COMMENT '{\"format\":\"int\"}',
  `value` varchar(5000) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"required\":false,\"has_upload\":true}',
  `time` datetime(0) NULL DEFAULT NULL COMMENT '{\"format\":\"datetime\"}',
  `lang` tinyint(4) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"int\"}',
  `published` tinyint(4) NULL DEFAULT 0 COMMENT '{\"required\":false,\"format\":\"int\"}',
  `deleted` tinyint(4) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"int\"}',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `key`(`key`) USING BTREE,
  INDEX `a_delete`(`deleted`, `lang`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of universal_fragment
-- ----------------------------
INSERT INTO `universal_fragment` VALUES (1, 'beian', '备案号', 1, '', '2021-12-31 0:00:00', 0, 1, 0);
INSERT INTO `universal_fragment` VALUES (2, 'address', '详细地址', 1, '', '2021-12-31 0:00:00', 0, 1, 0);
INSERT INTO `universal_fragment` VALUES (3, 'phone', '联系电话', 1, '', '2021-12-31 0:00:00', 0, 1, 0);
INSERT INTO `universal_fragment` VALUES (4, 'wechat_qrcode', '微信公众号二维码', 2, '', '2021-12-31 0:00:00', 0, 1, 0);

-- ----------------------------
-- Table structure for universal_link
-- ----------------------------
DROP TABLE IF EXISTS `universal_link`;
CREATE TABLE `universal_link`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '{\"mode\":\"auto\"}',
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"type\":\"text\"}',
  `group` int(11) NULL DEFAULT 0 COMMENT '{\"type\":\"select\",\"source\":\"sel_group.*\"}',
  `url` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"type\":\"text\",\"required\":false}',
  `target` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '{\"type\":\"select\",\"required\":false,\"source\":\"sel_target.*\"}',
  `time` datetime(0) NULL DEFAULT NULL COMMENT '{\"type\":\"text\",\"format\":\"datetime\",\"hidden\":[\"add\"]}',
  `lang` tinyint(4) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"int\"}',
  `published` tinyint(4) NULL DEFAULT 0 COMMENT '{\"type\":\"switch\",\"required\":false,\"format\":\"int\"}',
  `deleted` tinyint(4) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\",\"required\":false,\"format\":\"int\"}',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `a_delete`(`deleted`, `lang`, `published`) USING BTREE,
  INDEX `a_time`(`time`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of universal_link
-- ----------------------------
INSERT INTO `universal_link` VALUES (1, '七牛云', 1, 'https://www.jtbc.cn/host/?name=qiniu', '_blank', '2021-12-31 0:00:00', 0, 1, 0);
INSERT INTO `universal_link` VALUES (2, '华为云', 1, 'https://www.jtbc.cn/host/?name=huawei', '_blank', '2021-12-31 0:00:00', 0, 1, 0);
INSERT INTO `universal_link` VALUES (3, '腾讯云', 1, 'https://www.jtbc.cn/host/?name=tencent', '_blank', '2021-12-31 0:00:00', 0, 1, 0);
INSERT INTO `universal_link` VALUES (4, '阿里云', 1, 'https://www.jtbc.cn/host/?name=aliyun', '_blank', '2021-12-31 0:00:00', 0, 1, 0);

-- ----------------------------
-- Table structure for universal_material
-- ----------------------------
DROP TABLE IF EXISTS `universal_material`;
CREATE TABLE `universal_material`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '{\"mode\":\"auto\"}',
  `filename` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `filepath` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `fileurl` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `filetype` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `filesize` int(11) NULL DEFAULT 0,
  `filesize_text` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `filegroup` tinyint(4) NULL DEFAULT 0,
  `time` datetime(0) NULL DEFAULT NULL,
  `hot` int(11) NULL DEFAULT 0,
  `deleted` tinyint(4) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\"}',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `filetype`(`filetype`) USING BTREE,
  INDEX `hot`(`hot`) USING BTREE,
  INDEX `lang`(`deleted`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for universal_tag
-- ----------------------------
DROP TABLE IF EXISTS `universal_tag`;
CREATE TABLE `universal_tag`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '{\"mode\":\"auto\"}',
  `tag` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `genre` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `associated_count` int(11) NULL DEFAULT 0,
  `lang` int(11) NULL DEFAULT 0,
  `deleted` tinyint(4) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\"}',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `tag`(`tag`, `genre`, `lang`) USING BTREE,
  INDEX `deleted`(`deleted`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for universal_tag-map
-- ----------------------------
DROP TABLE IF EXISTS `universal_tag-map`;
CREATE TABLE `universal_tag-map`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '{\"mode\":\"auto\"}',
  `tag_id` int(11) NULL DEFAULT 0,
  `genre` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `associated_id` int(11) NULL DEFAULT 0,
  `status` int(11) NULL DEFAULT 0,
  `deleted` tinyint(4) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\"}',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `deleted`(`deleted`) USING BTREE,
  INDEX `genre`(`genre`, `associated_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for universal_upload
-- ----------------------------
DROP TABLE IF EXISTS `universal_upload`;
CREATE TABLE `universal_upload`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '{\"mode\":\"auto\"}',
  `filename` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `filesize` int(11) NULL DEFAULT 0,
  `filesize_text` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `filetype` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `filepath` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `fileurl` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `filegroup` tinyint(4) NULL DEFAULT 0,
  `genre` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `associated_id` int(11) NULL DEFAULT 0,
  `group` tinyint(4) NULL DEFAULT 0,
  `status` tinyint(4) NULL DEFAULT 0,
  `time` datetime(0) NULL DEFAULT NULL,
  `deleted` tinyint(4) NULL DEFAULT 0 COMMENT '{\"mode\":\"manual\"}',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `status`(`status`) USING BTREE,
  INDEX `genre`(`genre`, `associated_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;