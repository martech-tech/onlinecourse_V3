-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 31, 2026 at 04:12 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `onlinecourse`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `email`, `password_hash`, `is_active`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 'admin@jknowledge.com', '$2b$12$VjUygcTyA1CJE4yiCilA2eImvXWtjAGr804PsbadIIHP..3ejC53e', 1, '2026-03-31 20:51:23.294', '2026-02-07 23:31:02.133', '2026-03-31 20:51:23.294');

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `register_code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description_html` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `thumbnail_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `intro_video_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `intro_video_provider` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `categories_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `tags_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `pricing_model` enum('free','paid') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'free',
  `compare_at_price` decimal(10,2) DEFAULT NULL,
  `pricing_amount` decimal(10,2) DEFAULT NULL,
  `pricing_currency` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'THB',
  `book_product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `visibility_type` enum('public','password') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'public',
  `enable_qna` tinyint(1) NOT NULL DEFAULT 1,
  `status` enum('draft','published') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `title`, `slug`, `register_code`, `password_hash`, `description_html`, `thumbnail_url`, `intro_video_url`, `intro_video_provider`, `level`, `categories_json`, `tags_json`, `pricing_model`, `compare_at_price`, `pricing_amount`, `pricing_currency`, `book_product_id`, `visibility_type`, `enable_qna`, `status`, `created_at`, `updated_at`) VALUES
(1, 'คอร์สติวเตรียมสอบ ก.พ. พร้อมวิดีโอติว 40 ชม.', 'korpor-book', '2ac6e9b386b315dd', '$2b$10$6W62fu6A.K3QvPchAqLcxO.8jsMWO2pVAakJC7n3id3mdD85hMkwy', '<p>คอร์สติวเตรียมสอบ ก.พ. พร้อมวิดีโอติว 40 ชม. ฉบับคนมีเวลาน้อยต้องดู หนังสือติวและเฉลยข้อสอบจริง ก.พ.(ภาค ก) 69 เล่มเดียวจบ<br/>✔️ตรงโครงสร้างที่ออกสอบ<br/>✔️ไม่มีพื้นฐาน มีเวลาน้อยก็อ่านได้<br/>✔️เทคนิคลัด ตะลุยโจทย์ ทำข้อสอบได้ทันเวลา<br/>✔️พร้อมข้อสอบจริง ก.พ.<br/>เนื้อหาครอบคลุมการก.พ. ครบทุกหัวข้อที่ออกสอบ<br/>✅วิชาความสามารถทั่วไป (คณิตศาสตร์)<br/>✅วิชาภาษาไทย<br/>✅วิชาภาษาอังกฤษ<br/>✅วิชาความรู้และทักษะการเป็นข้าราชการที่ดี</p>', 'https://apicourse.jknowledgetest.com/uploads/course-thumbnails/course-thumb-1771385930291-c1f82d61-a8ad-4486-8e27-c6cdc5faeac7.png', NULL, NULL, 'All Levels', '[\"สอบราชการ\",\"ก.พ.\"]', '[\"กพ\"]', 'free', NULL, NULL, 'THB', NULL, 'password', 1, 'draft', '2026-01-04 15:32:42.561', '2026-02-18 03:40:04.618'),
(2, 'คอร์สติวเตรียมสอบ A-Level พิชิต TCAS 69-70 ม.ปลาย เกณฑ์ใหม่ 20 ชม.', 'alevel-book', '4aae196e22ac6bac', '$2b$10$tAlbnBqGBPwNdAPMvTv/nuCu37oFMPWFKamryZ4H3lR0Q/sq7ctmW', '<p>คอร์สติวเตรียมสอบ A-Level พร้อมเฉลยละเอียด ในเล่มเดียว TCAS 69-70 เกณฑ์ใหม่ ตามแนวข้อสอบจริง (Test blueprint) ครบ 7 วิชา <br/>   -คณิตศาสตร์ประยุกต์ 1<br/>   -ฟิสิกส์<br/>   -เคมี<br/>   -ชีววิทยา<br/>   -ภาษาไทย<br/>   -ภาษาอังกฤษ<br/>   -สังคมศึกษา</p>', 'https://apicourse.jknowledgetest.com/uploads/course-thumbnails/course-thumb-1771344015498-b43fed3b-2269-400c-b599-d150d2e531f8.jpg', NULL, NULL, 'All Levels', '[\"TCAS\",\"A-Level\"]', '[\"A-LEVEL\"]', 'free', NULL, NULL, 'THB', NULL, 'password', 0, 'draft', '2026-01-04 15:36:41.231', '2026-02-18 02:27:52.957'),
(3, 'คอร์สติวสรุปเนื้อหาทุกวิชา TCAS A-level 69-70-71 เกณฑ์ใหม่ 25 ชม.', 'tcas-book', '3c0f0d3865a8be87', '$2b$10$sUrWgfv8rKcg7t9eIEl14uMt6oS4aILoMcWRL1mq796iIJJJThoDe', '<p>หนังสือสรุปเนื้อหา ม.ปลาย พร้อมคอร์สติวสรุป 25 ชม. พิชิต TCAS 69-70-71 เกณฑ์ใหม่ ตามแนว สสวท. ที่ออกสอบบ่อยที่สุด ทุกสนาม พร้อมสอบ A-Level (วิชาสามัญ) ครบทุกวิชาในเล่มเดียว<br/>   -คณิตศาสตร์ประยุกต์<br/>   -ฟิสิกส์<br/>   -เคมี<br/>   -ชีววิทยา<br/>   -ภาษาไทย<br/>   -ภาษาอังกฤษ<br/>   -สังคมศึกษา</p>', 'https://apicourse.jknowledgetest.com/uploads/course-thumbnails/course-thumb-1771343288070-dd463cca-831d-449a-bb47-39b66ecc2980.jpg', NULL, NULL, 'All Levels', '[\"TCAS\",\"A-Level\"]', '[\"TCAS\",\"A-LEVEL\"]', 'free', NULL, NULL, 'THB', NULL, 'password', 0, 'draft', '2026-01-04 15:36:49.877', '2026-02-18 03:52:52.770'),
(4, 'คอร์สติวหนังสือเตรียมสอบท้องถิ่น พร้อมวิดีโอติว 35 ชม.', 'local', 'b441a172a04ef9a7', '$2b$10$IMrDBQJB0rh8lO0066p82uLKdCF5mp2I7U4oHndQSf1t5BzW8CicW', '<p>คอร์สติว หนังสือเตรียมสอบท้องถิ่น พร้อมวิดีโอติว 35 ชม. ครบทั้ง 4 วิชา<br/>✔️ สำหรับเตรียมสอบท้องถิ่น 69 ภาค ก ทุกตำแหน่ง ฉบับสอบครั้งเดียวผ่าน<br/>✔️ สำหรับผู้ที่ไม่มีพื้นฐาน มีเวลาน้อย เล่มนี้เล่มเดียวจบ ครบทุกเนื้อหาที่ออกสอบ<br/>. เนื้อหาครอบคลุมการสอบท้องถิ่น 69 ครบทุกหัวข้อที่ออกสอบ<br/>.<br/>ยึดตามโครงสร้างที่ออกข้อสอบจริง<br/>.<br/>✅วิชาความสามารถทั่วไป (คณิตศาสตร์)<br/>- อนุกรม<br/>- โอเปอร์เรชั่น<br/>- คณิตศาสตร์ทั่วไป<br/>- โจทย์วิเคราะห์ตาราง<br/>- สรุปความจากภาษา<br/>- เงื่อนไขสัญลักษณ์<br/>- การสรุปความจากสัญลักษณ์<br/>- ข้อสอบจริงและเฉลยแบบละเอียด<br/>✅วิชาภาษาไทย<br/>- อุปมาอุปไมย<br/>- เงื่อนไขทางภาษา<br/>- การเรียงประโยค<br/>- การใช้ภาษา<br/>- การอ่านบทความ บทความสั้น /บทความยาว<br/>- ข้อสอบจริงและเฉลยแบบละเอียด<br/>✅วิชาภาษาอังกฤษ<br/>- บทสนทนา<br/>- คำศัพท์<br/>- บทความ<br/>- ไวยากรณ์<br/>- ข้อสอบจริงและเฉลยแบบละเอียด<br/>✅วิชาความรู้พื้นฐานข้าราชการ ครบทั้ง 13 พ.ร.บ.<br/>- ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. 2526<br/>- พระราชบัญญัติการอำนวยความสะดวกในการพิจารณาอนุญาตของทางราชการ พ.ศ. 2558<br/>- พระราชกฤษฎีกาว่าด้วยหลักเกณฑ์และวิธีการบริหารกิจการบ้านเมืองที่ดี พ.ศ. 2546<br/>- พระราชบัญญัติระเบียบบริหารราชการเมืองพัทยา พ.ศ. 2542<br/>- พระราชบัญญัติองค์การบริหารส่วนจังหวัด พ.ศ. 2540<br/>- พระราชบัญญัติสภาตำบลและองค์การบริหารส่วนตำบล พ.ศ. 2537<br/>- รัฐธรรมนูญแห่งราชอาณาจักรไทย พุทธศักราช 2560<br/>- พระราชบัญญัติกำหนดแผนและขั้นตอนการกระจายอำนาจให้แก่องค์กรปกครองส่วนท้องถิ่น พ.ศ. 2542<br/>- พระราชบัญญัติระเบียบบริหารงานบุคคลส่วนท้องถิ่น พ.ศ. 2542<br/>- พระราชบัญญัติระเบียบบริหารราชการแผ่นดิน พ.ศ. 2534<br/>- พระราชบัญญัติเทศบาล พ.ศ. 2496<br/>- พระราชบัญญัติวิธีปฏิบัติราชการทางปกครอง พ.ศ. 2539<br/>- ประมวลจริยธรรมข้าราชการส่วนท้องถิ่น<br/>🔴 เตรียมตัวดีมีชัยไปกว่าครึ่ง 🔴<br/>\"ขอให้ทุกคน สอบติดเป็นข้าราชการดั่งใจหวังนะครับ\"</p>', 'https://apicourse.jknowledgetest.com/uploads/course-thumbnails/course-thumb-1771386046487-940ce7f0-8ed0-4506-947d-fbfe90367cae.png', NULL, NULL, 'All Levels', '[\"สอบราชการ\",\"สอบท้องถิ่น\"]', '[\"สอบท้องถิ่น\"]', 'free', NULL, NULL, 'THB', NULL, 'password', 1, 'draft', '2026-01-04 15:36:58.450', '2026-02-18 17:32:37.876'),
(9, 'คอร์สติวสรุปเนื้อหา และแนวข้อสอบ TGAT-ENG 20 ชม.', 'course-tgat-eng', 'ef3239b685651433', '$2b$10$hvCyk/w6FMuqrh8xDbEGEekmH/ZRutRfCNVa6ZWfPUIk0.RneL8Te', '<p>คอร์สสรุปเนื้อหา เฉลยข้อสอบละเอียดทุกข้อ 20 ชม. เตรียมสอบ TGAT ENG ได้อย่างมั่นใจ เล่มเดียวจบครบทุกเรื่องที่ออกสอบ ตามแนวข้อสอบจริง (Test blueprint)</p>', 'https://apicourse.jknowledgetest.com/uploads/course-thumbnails/course-thumb-1771344083900-7eaf1a2f-1101-4770-a54b-585898eef841.jpg', NULL, NULL, 'All Levels', '[\"TCAS\",\"TGAT\"]', '[]', 'free', NULL, NULL, 'THB', NULL, 'password', 0, 'draft', '2026-02-07 21:17:20.595', '2026-02-18 05:04:32.852'),
(10, 'คอร์สติวเตรียมสอบ NETSAT มข. เล่มเดียวครบทั้ง SAT I และ SAT II 21 ชม.', 'netsat', 'd2c46dcf412796dc', '$2b$10$W6/W.ckcPhM5V8NdaDFZUesLYhOtjm3UFPMVv/tr4fZ5t7YGrhMjS', '<p>คอร์สติวสรุปเนื้อหา NETSAT มข. และเฉลยอธิบายละเอียดแนวข้อสอบ NETSAT มข. พร้อมสอบ ครบทั้ง SAT I และ SAT II ครบทุกความฉลาดรู้ ทั้งหมด 21 ชั่วโมง<br/>SAT I ความฉลาดรู้ทั่วไป<br/>      ความฉลาดรู้ทั่วไป ด้านภาษาไทย ด้านภาษาอังกฤษ<br/>      ความฉลาดรู้ทั่วไป ด้านคณิตศาสตร์<br/>SAT II ความฉลาดรู้เฉพาะด้าน<br/>      ความฉลาดรู้เฉพาะด้าน วิทยาศาสตร์ และเทคโนโลยี<br/>      ความฉลาดรู้เฉพาะด้าน ฟิสิกส์<br/>      ความฉลาดรู้เฉพาะด้าน เคมี<br/>      ความฉลาดรู้เฉพาะด้าน ชีววิทยา</p>', 'https://apicourse.jknowledgetest.com/uploads/course-thumbnails/course-thumb-1771344652291-15e5ab73-b9f6-47d2-8aab-27fc63a76572.jpg', NULL, NULL, 'All Levels', '[\"NETSAT\"]', '[]', 'free', NULL, NULL, 'THB', NULL, 'password', 1, 'draft', '2026-02-07 21:17:31.170', '2026-02-17 16:57:12.696'),
(11, 'คอร์สติวเตรียมสอบ NETSAT สายวิศวะ พิชิตรอบ 2 โควตา มข. ครบทั้ง SAT l และ SAT ll 20 ชม.', 'netsat_en', '58ae985c57d0b091', '$2b$10$Qu.SbPUT0P6QzobqjEwyKuSH/e.cPG20yEjaezWHTP2XZxUk/MhMa', '<p>เตรียมความพร้อมสู่สายวิศวะ มหาวิทยาลัยขอนแก่น โค้งสุดท้ายกับหนังสือ คอร์สติว NETSAT สายวิศวะฯ พร้อมเฉลยข้อสอบ กว่า 20 ชั่วโมง<br/>รวมครบทุกความฉลาดรู้ ที่ใช้สอบสายวิศวะในมหาวิทยาลัยขอนแก่น<br/>     SAT1 ความฉลาดรู้ทั่วไป ด้านคณิตศาสตร์<br/>     SAT1 ความฉลาดรู้ทั่วไป ด้านภาษาอังกฤษ<br/>     SAT2 ความฉลาดเฉพาะด้านฟิสิกส์<br/>     SAT2 ความฉลาดเฉพาะด้านเคมี<br/>     TPAT3 ข้อสอบวัดความถนัดด้านวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์</p>', 'https://apicourse.jknowledgetest.com/uploads/course-thumbnails/course-thumb-1771345600384-8e19eb13-ed7e-48d5-a7c7-281820120c22.jpg', NULL, NULL, 'All Levels', '[\"NETSAT\",\"สายวิศวะ\",\"TPAT3\"]', '[]', 'free', NULL, NULL, 'THB', NULL, 'password', 1, 'draft', '2026-02-07 21:17:40.533', '2026-02-18 05:03:19.031'),
(12, 'คอร์สติวเตรียมสอบ NETSAT สายแพทย์ พิชิตรอบ 2 โควตา มข. ครบทั้ง SAT l และ SAT ll 20 ชม.', 'netsat_med', '5b348707ec437a99', '$2b$10$g2A33K/h5gwtA3TkL33AVOnc.Uqri7VBW5c.9yzyr40iYbcwP5dr.', '<p>เตรียมความพร้อมสู่สายแพทย์ มข. (แพทย์ ทันตะ เภสัช สัตวแพทย์ เทคนิคการแพทย์)<br/>รวมครบทุกความฉลาดรู้ ที่ใช้สอบสายแพทย์ในมหาวิทยาลัยขอนแก่น<br/>     SAT1 ความฉลาดรู้ทั่วไป ด้านคณิตศาสตร์<br/>     SAT1 ความฉลาดรู้ทั่วไป ด้านภาษาไทย<br/>     SAT1 ความฉลาดรู้ทั่วไป ด้านภาษาอังกฤษ<br/>     SAT2 ความฉลาดเฉพาะด้านฟิสิกส์<br/>     SAT2 ความฉลาดเฉพาะด้านเคมี<br/>     SAT2 ความฉลาดเฉพาะด้านชีววิทยา<br/>     SAT2 ความฉลาดเฉพาะด้านวิทยาศาสตร์ เทคโนโลยี</p>', 'https://apicourse.jknowledgetest.com/uploads/course-thumbnails/course-thumb-1771345732989-cec68276-2eda-4a04-bfb2-33b48da052cd.jpg', NULL, NULL, 'All Levels', '[\"NETSAT\",\"สายแพทย์\"]', '[]', 'free', NULL, NULL, 'THB', NULL, 'password', 1, 'draft', '2026-02-07 21:17:48.532', '2026-02-18 04:56:33.347'),
(13, 'คอร์สติวเตรียมสอบสายแพทย์ พิชิต TPAT1 ความถนัดแพทย์ และ A-Level ทุกวิชา 40 ชม.', 'alevel_med', '02567b05fff16cef', '$2b$10$rnYdBxw.44pwKbjJSvBkjOyjoq8.m7PgnDQXkwhHXg5cjnptKlAtG', '<p>เตรียมความพร้อมสู่สายแพทย์ แพทย์ ทันตะ เภสัช สัตวแพทย์ เทคนิคการแพทย์ สหเวชฯ) เล่มเดียวจบ ครบทุกวิชาที่ใช้สอบสายแพทย์ ครบทุกหัวข้อตามโครงสร้างข้อสอบจริง Test Blueprint เกณฑ์ใหม่ล่าสุด<br/>     TPAT1 ความถนัดแพทย์ กสพท<br/>     A-Level คณิตศาสตร์ประยุกต์1<br/>     A-Level ฟิสิกส์<br/>     A-Level เคมี<br/>     A-Level ชีววิทยา<br/>     A-Level ภาษาอังกฤษ<br/>     A-Level ภาษาไทย<br/>     A-Level สังคมศึกษา</p>', 'https://apicourse.jknowledgetest.com/uploads/course-thumbnails/course-thumb-1771345805193-c3a67d67-695f-41ed-a89f-02989e42c518.jpg', NULL, NULL, 'All Levels', '[\"TCAS\",\"A-Level\",\"TPAT1\",\"สายแพทย์\"]', '[]', 'free', NULL, NULL, 'THB', NULL, 'password', 1, 'draft', '2026-02-07 21:17:58.493', '2026-02-18 04:38:48.808'),
(14, 'คอร์สติวเตรียมสอบพยาบาล มหาวิทยาลัยชั้นนำ พยาบาลพระบรม พยาบาล 4 เหล่าทัพ', 'alevel_nurse', '63efd88386d569ae', '$2b$10$xkDDCS8TYQkllOU6bSy.6ucWQVlFUDD01DmOiAzAHQyece5d1YkAW', '<p>คอร์สติวเตรียมสอบพยาบาล มหาวิทยาลัยชั้นนำ พยาบาลพระบรม พยาบาล 4 เหล่าทัพ พิชิต A-Level ทุกวิชาที่พยาบาลต้องใช้สอบ พร้อมคอร์สพิชิตพยาบาล ม.ชั้นนำ พยาบาลพระบรม พยาบาล 4 เหล่าทัพ ติวและเฉลยละเอียด กว่า 28 ชม.<br/>เล่มเดียวจบ ครบทุกวิชาที่ใช้สอบพยาบาล ครบทุกหัวข้อตามโครงสร้างข้อสอบจริง Test Blueprint เกณฑ์ใหม่ล่าสุด<br/>     A-Level คณิตศาสตร์ประยุกต์1<br/>     A-Level ฟิสิกส์<br/>     A-Level เคมี<br/>     A-Level ชีววิทยา<br/>     A-Level ภาษาอังกฤษ<br/>     A-Level ภาษาไทย<br/>     A-Level สังคมศึกษา</p>', 'https://apicourse.jknowledgetest.com/uploads/course-thumbnails/course-thumb-1771345871895-40037f68-b266-4dcf-a768-bb2d8dc94a77.jpg', NULL, NULL, 'All Levels', '[\"TCAS\",\"A-Level\",\"พยาบาล\"]', '[]', 'free', NULL, NULL, 'THB', NULL, 'password', 1, 'draft', '2026-02-07 21:18:06.166', '2026-02-18 04:36:40.308'),
(15, 'คอร์สติวเตรียมสอบครู ครุศาสตร์/ศึกษาศาสตร์ พิชิต A-Level 25 ชม.', 'alevel_teacher', '65a253962cfdf1d3', '$2b$10$fBn55TjpKYEoJrlp6KGoY.TOZQOisFKPnxifq3v6o5zEXBXtIs7HW', '<p>เตรียมสอบสายครุศาสตร์-ศึกษาศาสตร์ + คอร์สติวเฉลยข้อสอบ กว่า 25 ชั่วโมง เล่มเดียวจบ ครบทุกวิชาที่ใช้สอบครู ครบทุกหัวข้อตามโครงสร้างข้อสอบจริง Test Blueprint เกณฑ์ใหม่ล่าสุด <br/>     TPAT5 ความถนัดครุศาสตร์-ศึกษาศาสตร์<br/>     A-Level คณิตศาสตร์ประยุกต์1<br/>     A-Level ภาษาอังกฤษ<br/>     A-Level ภาษาไทย<br/>     A-Level สังคมศึกษา</p>', 'https://apicourse.jknowledgetest.com/uploads/course-thumbnails/course-thumb-1771345956936-f781f8ba-3e63-4df5-b82a-fef7a830b41c.jpg', NULL, NULL, 'All Levels', '[\"TCAS\",\"A-Level\",\"TPAT5\",\"สายครู\"]', '[]', 'free', NULL, NULL, 'THB', NULL, 'password', 1, 'draft', '2026-02-07 21:18:15.075', '2026-02-18 04:42:08.297'),
(16, 'คอร์สเตรียมสอบวิศวะ พิชิต TPAT3 ความถนัดวิศวะ และ A-Level ทุกวิชา 28 ชม.', 'alevel_en', '719fe72d219f99a3', '$2b$10$hlYsbsd/MRHfRDt6eAnENODZCa1X/XH43.5UGlcGgL85lKCps1w26', '<p>แนวข้อสอบ A-Level เสมือนจริงตามโครงสร้างข้อสอบจริง (Test blueprint) ติวเฉลย A-Level ละเอียดทุกข้อ 28 ชม. ครบจบทุกวิชา<br/>     TPAT3<br/>     คณิตศาสตร์<br/>     เคมี<br/>     ภาษาอังกฤษ<br/>     ฟิสิกส์</p>', 'https://apicourse.jknowledgetest.com/uploads/course-thumbnails/course-thumb-1771346155277-54ce9df3-8ed5-4275-b714-915d15be56ef.jpg', NULL, NULL, 'All Levels', '[\"TCAS\",\"A-Level\",\"TPAT3\",\"สายวิศวะ\"]', '[]', 'free', NULL, NULL, 'THB', NULL, 'password', 1, 'draft', '2026-02-07 21:18:22.412', '2026-02-18 04:44:17.220'),
(17, 'คอร์สติวพิชิต A-Level วิชาคณิตศาสตร์ 15 ชั่วโมง', 'alevel_math', 'eb4a092f90b975b1', '$2b$10$AZ5H5YK7.N300aHZIBYzbeXENU7pP41qKUQk29fuR7hdYBuYE4O3i', '<p>คอร์สติวแนวข้อสอบเสมือนจริงพร้อมเฉลยอย่างละเอียด A-LEVEL วิชา คณิตศาสตร์ 15 ชั่วโมง<br/>     แนวข้อสอบแม่นยำ<br/>     ครบถ้วนตามโครงสร้างข้อสอบจริง<br/>     เฉลยละเอียดในเล่มทุกข้อ<br/>     สำหรับสอบเข้ามหาวิทยาลัย<br/>     โดยทีมสุดยอดติวเตอร์คุณภาพ</p>', 'https://apicourse.jknowledgetest.com/uploads/course-thumbnails/course-thumb-1771346204060-e2b48e6a-3193-4791-94ef-fa61653f30ac.jpg', NULL, NULL, 'All Levels', '[\"A-Level\"]', '[]', 'free', NULL, NULL, 'THB', NULL, 'password', 1, 'draft', '2026-02-07 21:18:30.394', '2026-02-17 16:58:01.368'),
(18, 'คอร์สติวพิชิต A-Level วิชาฟิสิกส์ 20 ชั่วโมง', 'alevel_physic', '5b26196f5e965c10', '$2b$10$z6jz0eviTNGqfar5Edo4pOxkfGbgvY5yFExiboN2Iyw6SnexMjEia', '<p>คอร์สติวแนวข้อสอบเสมือนจริงพร้อมเฉลยอย่างละเอียด A-LEVEL วิชา ฟิสิกส์ 20 ชั่วโมง<br/>     แนวข้อสอบแม่นยำ<br/>     ครบถ้วนตามโครงสร้างข้อสอบจริง<br/>     เฉลยละเอียดในเล่มทุกข้อ<br/>     สำหรับสอบเข้ามหาวิทยาลัย<br/>     โดยทีมสุดยอดติวเตอร์คุณภาพ</p>', 'https://apicourse.jknowledgetest.com/uploads/course-thumbnails/course-thumb-1771346266748-80677050-9cd2-4154-8dff-5e326580821a.jpg', NULL, NULL, 'All Levels', '[\"A-Level\"]', '[]', 'free', NULL, NULL, 'THB', NULL, 'password', 1, 'draft', '2026-02-07 21:18:38.489', '2026-02-17 16:58:03.353'),
(19, 'คอร์สติวพิชิต A-Level วิชาเคมี 20 ชั่วโมง', 'alevel_chemical', '0e9747b7869bec75', '$2b$10$dYh14wIzn2Vs9ksOyGUi5O4CXEJbcIF8S3MllQBFYtAPFAcvyHKX.', '<p>คอร์สติวแนวข้อสอบเสมือนจริงพร้อมเฉลยอย่างละเอียด A-LEVEL วิชา เคมี 20 ชั่วโมง<br/>     แนวข้อสอบแม่นยำ<br/>     ครบถ้วนตามโครงสร้างข้อสอบจริง<br/>     เฉลยละเอียดในเล่มทุกข้อ<br/>     สำหรับสอบเข้ามหาวิทยาลัย<br/>     โดยทีมสุดยอดติวเตอร์คุณภาพ</p>', 'https://apicourse.jknowledgetest.com/uploads/course-thumbnails/course-thumb-1771346318670-4044cd27-6653-4705-89e7-1a30ea27337d.jpg', NULL, NULL, 'All Levels', '[\"A-Level\"]', '[]', 'free', NULL, NULL, 'THB', NULL, 'password', 1, 'draft', '2026-02-07 21:18:48.657', '2026-02-17 16:58:05.589'),
(20, 'คอร์สติวพิชิต A-Level วิชาชีววิทยา 20 ชั่วโมง', 'alevel_biology', 'e4ee4b655f0a8984', '$2b$10$B/oL5D1YUnucnt7jQQCTaO8Qa7fUicYieXyFAghcYmRmt/2f4hBvi', '<p>คอร์สติวแนวข้อสอบเสมือนจริงพร้อมเฉลยอย่างละเอียด A-LEVEL วิชา ชีววิทยา 20 ชั่วโมง<br/>     แนวข้อสอบแม่นยำ<br/>     ครบถ้วนตามโครงสร้างข้อสอบจริง<br/>     เฉลยละเอียดในเล่มทุกข้อ<br/>     สำหรับสอบเข้ามหาวิทยาลัย<br/>     โดยทีมสุดยอดติวเตอร์คุณภาพ</p>', 'https://apicourse.jknowledgetest.com/uploads/course-thumbnails/course-thumb-1771346369674-b379fd4c-49f2-47a3-b0d3-d51402909058.jpg', NULL, NULL, 'All Levels', '[\"A-Level\"]', '[]', 'free', NULL, NULL, 'THB', NULL, 'password', 1, 'draft', '2026-02-07 21:18:57.186', '2026-02-17 16:58:07.357'),
(21, 'คอร์สติวพิชิต A-level วิชาภาษาไทยและสังคมศึกษา 15 ชั่วโมง', 'alevel_thai', 'd695e58a1180a9ea', '$2b$10$m.3hXZknatSkedJao1BDEentIiJ6BC6TgNJpwdpmcbhf4ULnXCCca', '<p>คอร์สติวแนวข้อสอบเสมือนจริงพร้อมเฉลยอย่างละเอียด A-LEVEL วิชาภาษาไทยและสังคมศึกษา 15 ชั่วโมง<br/>     แนวข้อสอบแม่นยำ<br/>     ครบถ้วนตามโครงสร้างข้อสอบจริง<br/>     เฉลยละเอียดในเล่มทุกข้อ<br/>     สำหรับสอบเข้ามหาวิทยาลัย<br/>     โดยทีมสุดยอดติวเตอร์คุณภาพ</p>', 'https://apicourse.jknowledgetest.com/uploads/course-thumbnails/course-thumb-1771346418504-8929e481-be24-4e17-9c1d-eabbc361949e.jpg', NULL, NULL, 'All Levels', '[\"A-Level\"]', '[]', 'free', NULL, NULL, 'THB', NULL, 'password', 1, 'draft', '2026-02-07 21:19:04.953', '2026-02-17 16:58:14.057'),
(22, 'คอร์สติวพิชิต A-Level วิชาภาษาอังกฤษ 15 ชั่วโมง', 'alevel_english', '8d779f0efdb5fcfe', '$2b$10$PNb/WfsmV0hnsPh4SUEmf.SsOpeK7koa2m9bYvhI5eaFZmneclSZS', '<p>คอร์สติวแนวข้อสอบเสมือนจริงพร้อมเฉลยอย่างละเอียด A-LEVEL วิชา ภาษาอังกฤษ 15 ชั่วโมง<br/>     แนวข้อสอบแม่นยำ<br/>     ครบถ้วนตามโครงสร้างข้อสอบจริง<br/>     เฉลยละเอียดในเล่มทุกข้อ<br/>     สำหรับสอบเข้ามหาวิทยาลัย<br/>     โดยทีมสุดยอดติวเตอร์คุณภาพ</p>', 'https://apicourse.jknowledgetest.com/uploads/course-thumbnails/course-thumb-1771346467936-d01f0d06-a35f-4793-a567-35be496c05c4.jpg', NULL, NULL, 'All Levels', '[\"A-Level\"]', '[]', 'free', NULL, NULL, 'THB', NULL, 'password', 1, 'draft', '2026-02-07 21:19:12.706', '2026-02-17 16:58:17.145'),
(23, 'คอร์สเฉลยแนวข้อสอบท้องถิ่น ภาค ก 25 ช.ม.', 'course_local_guideline', 'e40606c32407e22a', '$2b$10$kr18EpuzGWI1YnwxErsU0uAo5c8zaUUcizVWdiFzTL9XeBaiUg.tC', '<p>รวมแนวข้อสอบจริง + เฉลยข้อสอบ อัพเดทข้อสอบใหม่ล่าสุดตามโครงสร้างข้อสอบจริง 68 พร้อมแสดงวิธีทำและเฉลยอย่างละเอียด เข้าใจง่าย ที่สำคัญ  ยึดตามโครงสร้างที่ออกข้อสอบจริง ปีล่าสุด<br/>แนวข้อสอบครอบคลุมการสอบท้องถิ่น ภาค ก 68 ครบทุกหัวข้อ ครบทั้ง 4 วิชา<br/>    วิชาความสามารถทั่วไป (คณิตศาสตร์)<br/>    วิชาภาษาไทย<br/>    วิชาภาษาอังกฤษ<br/>    วิชาความรู้พื้นฐานข้าราชการ ครบทั้ง 13 พ.ร.บ. (อัพเดทล่าสุด)</p>', 'https://apicourse.jknowledgetest.com/uploads/course-thumbnails/course-thumb-1771346526451-a609a7c0-3116-4b95-8450-b2adbe40c0a6.jpg', NULL, NULL, 'All Levels', '[\"สอบราชการ\",\"สอบท้องถิ่น\"]', '[]', 'free', NULL, NULL, 'THB', NULL, 'password', 0, 'draft', '2026-02-07 21:19:20.594', '2026-02-18 04:56:03.744'),
(24, 'คอร์สติวเตรียมสอบมนุษย์ นิติ บริหาร พิชิต A-Level เกณฑ์ใหม่ล่าสุด 15 ชม.', 'a-level-huso', 'bd5510e07f1226c0', '$2b$10$7Nuu7.h6YTYdu2Gz1Lu.le97a9c.uogR8A1KxxYUWSmDOfQFrexXu', '<p>เตรียมความพร้อมสู่การสอบมนุษย์ฯ-นิติฯ-บริหารฯ ครบทุกวิชาที่ใช้สอบ ครบทุกหัวข้อตามโครงสร้างข้อสอบจริง Test Blueprint เกณฑ์ใหม่ล่าสุด <br/>     A-Level คณิตศาสตร์ประยุกต์1<br/>     A-Level ภาษาอังกฤษ<br/>     A-Level ภาษาไทย<br/>     A-Level สังคมศึกษา</p>', 'https://apicourse.jknowledgetest.com/uploads/course-thumbnails/course-thumb-1771346594009-3f17cdbc-2e52-4761-98d6-026d950c696a.jpg', NULL, NULL, 'All Levels', '[\"TCAS\",\"A-Level\",\"มนุษย์-นิติ-บริหาร\"]', '[]', 'free', NULL, NULL, 'THB', NULL, 'password', 0, 'draft', '2026-02-07 21:19:28.394', '2026-02-18 04:56:29.062'),
(25, 'คอร์สติวเฉลย ชุดข้อสอบ A-level สายแพทย์ 7 วิชา', 'a-level_set-med', 'bf213b960334b395', '$2b$10$cdSz7PuHRRVkGKiFrnoii.OszxSsWfMxhMdQJgeOWoDl8YA3MFoY.', '<p>คอร์สติวเฉลย ชุดข้อสอบ A-level สายแพทย์ 7 วิชา TCAS 69 70 71<br/>   -คณิตศาสตร์ประยุกต์ 1<br/>   -ฟิสิกส์<br/>   -เคมี<br/>   -ชีววิทยา<br/>   -ภาษาไทย<br/>   -ภาษาอังกฤษ<br/>   -สังคมศึกษา</p>', 'https://apicourse.jknowledgetest.com/uploads/course-thumbnails/course-thumb-1771346652786-f94cebd7-e3cf-44d0-b997-ccecf30ac970.jpg', NULL, NULL, 'All Levels', '[\"TCAS\",\"A-Level\",\"สายแพทย์\"]', '[\"A-LEVEL\"]', 'free', NULL, NULL, 'THB', NULL, 'password', 0, 'draft', '2026-02-07 21:19:36.035', '2026-02-18 04:50:08.673'),
(26, 'คอร์สติวเฉลย ชุดข้อสอบ A-level สายวิศวะ 4 วิชา', 'alevel_set-en', '87b5dba0efc477b4', '$2b$10$V8IC04jjFoSz5Z5flOpaYeIFqlUbidBxTYNX4d9KdGJImp5cELApi', '<p>คอร์สติวเฉลย ชุดข้อสอบ A-level สายวิศวะ 4 วิชา TCAS 69 70 71<br/>   -คณิตศาสตร์ประยุกต์ 1<br/>   -ฟิสิกส์<br/>   -เคมี<br/>   -ภาษาอังกฤษ</p>', 'https://apicourse.jknowledgetest.com/uploads/course-thumbnails/course-thumb-1771346766668-62934083-6cc8-4d59-b538-13e3a5b45b22.jpg', NULL, NULL, 'All Levels', '[\"TCAS\",\"A-Level\",\"สายวิศวะ\"]', '[\"A-LEVEL\"]', 'free', NULL, NULL, 'THB', NULL, 'password', 0, 'draft', '2026-02-07 21:19:44.971', '2026-02-18 04:47:59.666'),
(27, 'คอร์สติวเฉลย ชุดข้อสอบ A-level สายมนุษย์ศาสตร์ นิติศาสตร์ บริหารธุรกิจ อักษรศาสตร์ 4 วิชา', 'alevel_set-huso', '27d4d41bce9cea6c', '$2b$10$7.aG0A/j3T2S/b1ellAMoeRGk0szpTzDK38B5Z3DVhvtCqYc5woU.', '<p>คอร์สติวเฉลย ชุดข้อสอบ A-level สายมนุษย์ศาสตร์ นิติศาสตร์ บริหารธุรกิจ อักษรศาสตร์ 4 วิชา TCAS 69 70 71<br/>   -คณิตศาสตร์ประยุกต์ 1<br/>   -ภาษาไทย<br/>   -ภาษาอังกฤษ<br/>   -สังคมศึกษา</p>', 'https://apicourse.jknowledgetest.com/uploads/course-thumbnails/course-thumb-1771346814657-1828b741-1911-4171-b0b0-a3bdb41ddf77.jpg', NULL, NULL, 'All Levels', '[\"TCAS\",\"A-Level\",\"มนุษย์-นิติ-บริหาร\"]', '[\"A-LEVEL\"]', 'free', NULL, NULL, 'THB', NULL, 'password', 0, 'draft', '2026-02-07 21:19:55.043', '2026-02-18 04:46:29.065'),
(28, 'คอร์สติวเฉลย ชุดข้อสอบ A-level 3 วิชา', 'a-level_set-3', 'e33f54fceb869608', '$2b$10$QypkYT4QmpbXswOa9V3lcu5Rlf1FfsbH1SOmM9UrGNtKSs0CW7IhS', '<p>คอร์สติวเฉลย ชุดข้อสอบ A-level 3 วิชา TCAS 69 70 71<br/>   -ภาษาไทย<br/>   -ภาษาอังกฤษ<br/>   -สังคมศึกษา</p>', 'https://apicourse.jknowledgetest.com/uploads/course-thumbnails/course-thumb-1771347008919-c2b00fab-80cb-42cf-bb7f-dba585205a2f.jpg', NULL, NULL, 'All Levels', '[\"TCAS\",\"A-Level\"]', '[\"A-LEVEL\"]', 'free', NULL, NULL, 'THB', NULL, 'password', 0, 'draft', '2026-02-07 21:20:03.474', '2026-02-18 04:44:14.955'),
(29, 'คอร์สติวเฉลย ชุดข้อสอบ A-level 4 วิชา', 'set_alevel-4', 'd31a1e33b6aa3022', '$2b$10$7ZmJMLjYRviRWFTfbDbHUehaSZ.mpeCmpV0MU1yC5a8tMU4Ymmbka', '<p>คอร์สติวเฉลย ชุดข้อสอบ A-level 4 วิชา TCAS 69 70 71<br/>   -คณิตศาสตร์ประยุกต์ 1<br/>   -ฟิสิกส์<br/>   -เคมี<br/>   -ชีววิทยา</p>', 'https://apicourse.jknowledgetest.com/uploads/course-thumbnails/course-thumb-1771347065616-53c1f9b4-fbf0-4f0d-a03c-3ab398c38eb8.jpg', NULL, NULL, 'All Levels', '[\"TCAS\",\"A-Level\"]', '[\"A-LEVEL\"]', 'free', NULL, NULL, 'THB', NULL, 'password', 0, 'draft', '2026-02-07 21:20:12.146', '2026-02-18 04:41:05.044'),
(30, 'คอร์สทบทวน JSummer Camp', 'jsummer-camp', '73cd8b5581cf35a5', '$2b$10$lSiQF6M3tm3nfi.nRBZt..50EcNh7tzH2hPt70FWJmuQYOKjP1nYu', '', 'https://apicourse.jknowledgetest.com/uploads/course-thumbnails/course-thumb-1771260385691-4f595db5-6ed3-483f-a955-168e6d294e81.png', NULL, NULL, 'Intermediate', '[]', '[]', 'free', NULL, NULL, 'THB', NULL, 'password', 0, 'draft', '2026-02-16 16:40:32.022', '2026-02-24 07:22:13.032');

-- --------------------------------------------------------

--
-- Table structure for table `course_progress`
--

CREATE TABLE `course_progress` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `completed_lessons_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `percent_completed` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `last_accessed_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `course_progress`
--

INSERT INTO `course_progress` (`user_id`, `course_id`, `completed_lessons_json`, `percent_completed`, `last_accessed_at`) VALUES
(1, 2, '[39]', 3, '2026-02-07 15:49:29.000'),
(1, 12, '[]', 0, '2026-03-24 13:13:01.000'),
(1, 15, '[]', 0, '2026-03-24 13:32:21.000'),
(1, 18, '[]', 0, '2026-03-24 13:32:53.000');

-- --------------------------------------------------------

--
-- Table structure for table `course_registrations`
--

CREATE TABLE `course_registrations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `prefix` varchar(50) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `phone_number` varchar(50) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `grade` varchar(100) DEFAULT NULL,
  `school_province` varchar(100) DEFAULT NULL,
  `faculty_medicine` tinyint(1) NOT NULL DEFAULT 0,
  `faculty_dentistry` tinyint(1) NOT NULL DEFAULT 0,
  `faculty_veterinarians` tinyint(1) NOT NULL DEFAULT 0,
  `faculty_pharmacy` tinyint(1) NOT NULL DEFAULT 0,
  `faculty_medical_technology` tinyint(1) NOT NULL DEFAULT 0,
  `faculty_nursing` tinyint(1) NOT NULL DEFAULT 0,
  `faculty_engineering` tinyint(1) NOT NULL DEFAULT 0,
  `faculty_architecture` tinyint(1) NOT NULL DEFAULT 0,
  `faculty_science` tinyint(1) NOT NULL DEFAULT 0,
  `faculty_business_administration` tinyint(1) NOT NULL DEFAULT 0,
  `faculty_humanities` tinyint(1) NOT NULL DEFAULT 0,
  `faculty_literature` tinyint(1) NOT NULL DEFAULT 0,
  `faculty_social_sciences` tinyint(1) NOT NULL DEFAULT 0,
  `faculty_law` tinyint(1) NOT NULL DEFAULT 0,
  `faculty_education` tinyint(1) NOT NULL DEFAULT 0,
  `faculty_other_text` varchar(255) DEFAULT NULL,
  `university_chula` tinyint(1) NOT NULL DEFAULT 0,
  `university_thammasat` tinyint(1) NOT NULL DEFAULT 0,
  `university_mahidol` tinyint(1) NOT NULL DEFAULT 0,
  `university_chiangmai` tinyint(1) NOT NULL DEFAULT 0,
  `university_knonkaen` tinyint(1) NOT NULL DEFAULT 0,
  `university_songkhla` tinyint(1) NOT NULL DEFAULT 0,
  `university_ubon` tinyint(1) NOT NULL DEFAULT 0,
  `university_kingmongkut_north` tinyint(1) NOT NULL DEFAULT 0,
  `university_sarakham` tinyint(1) NOT NULL DEFAULT 0,
  `university_walailak` tinyint(1) NOT NULL DEFAULT 0,
  `university_maejo` tinyint(1) NOT NULL DEFAULT 0,
  `university_kingmongkut_ladkrabang` tinyint(1) NOT NULL DEFAULT 0,
  `university_other_text` varchar(255) DEFAULT NULL,
  `protocol` varchar(50) DEFAULT NULL,
  `agent` text DEFAULT NULL,
  `fbp` varchar(255) DEFAULT NULL,
  `fbc` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `postal` varchar(30) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `course_registrations`
--

INSERT INTO `course_registrations` (`id`, `course_id`, `user_id`, `prefix`, `full_name`, `phone_number`, `email`, `grade`, `school_province`, `faculty_medicine`, `faculty_dentistry`, `faculty_veterinarians`, `faculty_pharmacy`, `faculty_medical_technology`, `faculty_nursing`, `faculty_engineering`, `faculty_architecture`, `faculty_science`, `faculty_business_administration`, `faculty_humanities`, `faculty_literature`, `faculty_social_sciences`, `faculty_law`, `faculty_education`, `faculty_other_text`, `university_chula`, `university_thammasat`, `university_mahidol`, `university_chiangmai`, `university_knonkaen`, `university_songkhla`, `university_ubon`, `university_kingmongkut_north`, `university_sarakham`, `university_walailak`, `university_maejo`, `university_kingmongkut_ladkrabang`, `university_other_text`, `protocol`, `agent`, `fbp`, `fbc`, `city`, `postal`, `created_at`, `updated_at`) VALUES
(1, 9, 1, 'นาย', 'Tom Chakkrapan', '0830121275', 'kaewsiri@outlook.com', 'ม.6', 'Bangkok', 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, NULL, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, NULL, 'http', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', NULL, NULL, NULL, NULL, '2026-02-08 23:28:11.553', '2026-02-08 23:28:11.553'),
(2, 2, NULL, '???', 'Course OTP', '0880000002', 'course_otp_20260211095327@example.com', 'm6', 'Bangkok', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-11 16:53:27.443', '2026-02-11 16:53:27.443'),
(3, 2, NULL, '???', 'Course OTP', '0880000002', 'course_otp_20260211095335@example.com', 'm6', 'Bangkok', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-11 16:53:35.518', '2026-02-11 16:53:35.518'),
(4, 2, NULL, '???', 'Course OTP', '0880000002', 'course_otp_20260211095350@example.com', 'm6', 'Bangkok', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-11 16:53:50.568', '2026-02-11 16:53:50.568'),
(5, 2, NULL, '???', 'Course OTP', '0880000002', 'course_otp_20260211095402@example.com', 'm6', 'Bangkok', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-11 16:54:02.980', '2026-02-11 16:54:02.980'),
(6, 9, 1, 'นาย', 'Tom Chakkrapan', '0830121275', 'kaewsiri@outlook.com', 'ม.6', 'Bangkok', 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, NULL, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, NULL, 'http', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', NULL, NULL, NULL, NULL, '2026-02-14 16:57:51.557', '2026-02-14 16:57:51.557'),
(7, 3, 1, 'นาย', 'Tom Chakkrapan', '0830121275', 'kaewsiri@outlook.com', 'ม.6', 'Bangkok', 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, NULL, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, NULL, 'https', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', NULL, NULL, NULL, NULL, '2026-02-16 12:51:01.410', '2026-02-16 12:51:01.410'),
(27002, 12, 1, 'นาย', 'Tom Chakkrapan', '0830121275', 'kaewsiri@outlook.com', 'ม.6', 'Chiang Rai', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, 'http', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', NULL, NULL, NULL, NULL, '2026-03-24 13:13:01.405', '2026-03-24 13:13:01.405'),
(27003, 12, 1, 'นาย', 'Tom Chakkrapan', '0830121275', 'kaewsiri@outlook.com', 'ม.6', 'Chiang Rai', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, 'http', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', NULL, NULL, NULL, NULL, '2026-03-24 13:31:56.734', '2026-03-24 13:31:56.734'),
(27004, 15, 1, 'นาย', 'Tom Chakkrapan', '0830121275', 'kaewsiri@outlook.com', 'ม.6', 'Trang', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, NULL, 'http', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', NULL, NULL, NULL, NULL, '2026-03-24 13:32:21.179', '2026-03-24 13:32:21.179'),
(27005, 18, 1, 'นาย', 'Tom Chakkrapan', '0830121275', 'kaewsiri@outlook.com', 'ม.4', 'Chiang Mai', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, 'http', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0', NULL, NULL, NULL, NULL, '2026-03-24 13:32:53.413', '2026-03-24 13:32:53.413');

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

CREATE TABLE `enrollments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `progress_percent` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `completed_lessons_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `total_lessons_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `enrolled_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `enrollments`
--

INSERT INTO `enrollments` (`id`, `user_id`, `course_id`, `progress_percent`, `completed_lessons_count`, `total_lessons_count`, `enrolled_at`) VALUES
(1, 1, 4, 3, 2, 61, '2026-01-04 15:39:58.227'),
(3, 5, 4, 0, 0, 0, '2025-04-25 09:10:04.000'),
(4, 7, 4, 0, 0, 0, '2025-04-25 13:47:23.000'),
(5, 8, 4, 0, 0, 0, '2025-04-25 13:48:14.000'),
(6, 2, 4, 0, 0, 0, '2025-04-26 11:47:00.000'),
(7, 9, 4, 0, 0, 0, '2025-05-16 13:42:38.000'),
(8, 10, 4, 0, 0, 0, '2025-05-25 17:32:47.000'),
(9, 11, 4, 0, 0, 0, '2025-05-25 17:43:32.000'),
(10, 12, 4, 0, 0, 0, '2025-05-25 19:51:20.000'),
(11, 13, 4, 0, 0, 0, '2025-05-25 20:35:32.000'),
(12, 14, 4, 0, 0, 0, '2025-05-25 20:39:33.000'),
(13, 15, 4, 0, 0, 0, '2025-05-25 20:46:08.000'),
(25451, 1, 12, 0, 0, 25, '2026-03-24 13:13:01.400'),
(25452, 1, 15, 0, 0, 34, '2026-03-24 13:32:21.176'),
(25453, 1, 18, 0, 0, 3, '2026-03-24 13:32:53.408');

-- --------------------------------------------------------

--
-- Table structure for table `lessons`
--

CREATE TABLE `lessons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `module_id` bigint(20) UNSIGNED NOT NULL,
  `public_id` varchar(64) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `lesson_order` int(11) NOT NULL DEFAULT 0,
  `duration_seconds` int(10) UNSIGNED DEFAULT NULL,
  `type` varchar(20) DEFAULT NULL,
  `video_url` text DEFAULT NULL,
  `video_provider` varchar(50) DEFAULT NULL,
  `content_html` mediumtext DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lessons`
--

INSERT INTO `lessons` (`id`, `module_id`, `public_id`, `title`, `slug`, `lesson_order`, `duration_seconds`, `type`, `video_url`, `video_provider`, `content_html`, `is_active`, `created_at`, `updated_at`) VALUES
(4887, 660, '269', 'ข้อสอบจริงท้องถิ่น ปี2560 2562 และ2564 ep.1', '2560-2562', 0, 3869, 'video', 'https://player.mediadelivery.net/play/618924/a15b817c-f554-406c-ab7e-0b5b4b59e61c', 'unknown', NULL, 1, '2026-02-18 04:26:25.185', '2026-02-18 04:26:25.185'),
(4888, 660, '270', 'ข้อสอบจริงท้องถิ่น ปี2560 2562 และ2564 ep.2', '2560-2562-2', 1, 3337, 'video', 'https://player.mediadelivery.net/play/618924/f1440335-7707-49ce-a994-a846b9bc368e', 'unknown', NULL, 1, '2026-02-18 04:26:25.186', '2026-02-18 04:26:25.186'),
(4889, 660, '271', 'ข้อสอบจริงท้องถิ่น ปี2560 2562 และ2564 ep.3', '2560-2562-3', 2, 3301, 'video', 'https://player.mediadelivery.net/play/618924/0fe9a1bc-517c-447a-95e6-b36bdd92eb63', 'unknown', NULL, 1, '2026-02-18 04:26:25.186', '2026-02-18 04:26:25.186'),
(4890, 660, '272', 'ข้อสอบจริงท้องถิ่น ปี2560 2562 และ2564 ep.4', '2560-2562-4', 3, 4439, 'video', 'https://player.mediadelivery.net/play/618924/0a1aa01c-d76f-4f9d-99bd-4f0bf0b90c1c', 'unknown', NULL, 1, '2026-02-18 04:26:25.186', '2026-02-18 04:26:25.186'),
(4891, 660, '273', 'ข้อสอบจริงท้องถิ่น ปี2560 2562 และ2564 ep.5', '2560-2562-5', 4, 1973, 'video', 'https://player.mediadelivery.net/play/618924/a9f1b688-fed0-4b51-9955-d6d011e7e5bb', 'unknown', NULL, 1, '2026-02-18 04:26:25.187', '2026-02-18 04:26:25.187'),
(4892, 660, '274', 'อนุกรม', 'lesson-6', 5, 2838, 'video', 'https://player.mediadelivery.net/play/618924/b417e0ca-3ee9-46d2-a7ec-d63d3f7a0f17', 'unknown', NULL, 1, '2026-02-18 04:26:25.187', '2026-02-18 04:26:25.187'),
(4893, 660, '275', 'คณิตศาสตร์ทั่วไป', 'lesson-7', 6, 2795, 'video', 'https://player.mediadelivery.net/play/618924/5a4cf84b-b277-42be-a866-b213395f0026', 'unknown', NULL, 1, '2026-02-18 04:26:25.187', '2026-02-18 04:26:25.187'),
(4894, 660, '276', 'เงื่อนไขสัญลักษณ์', 'lesson-8', 7, 5973, 'video', 'https://player.mediadelivery.net/play/618924/34b1fec9-3fa8-4047-b648-12cb0007c451', 'unknown', NULL, 1, '2026-02-18 04:26:25.188', '2026-02-18 04:26:25.188'),
(4895, 660, '277', 'เงื่อนไขภาษา', 'lesson-9', 8, 2038, 'video', 'https://player.mediadelivery.net/play/618924/1a7e17b3-b849-401e-93e5-77310a081708', 'unknown', NULL, 1, '2026-02-18 04:26:25.188', '2026-02-18 04:26:25.188'),
(4896, 660, '278', 'วิเคราะห์ข้อมูลตาราง', 'lesson-10', 9, 3724, 'video', 'https://player.mediadelivery.net/play/618924/c595a831-f827-44e1-ac58-18d9ff1c56c7', 'unknown', NULL, 1, '2026-02-18 04:26:25.188', '2026-02-18 04:26:25.188'),
(4897, 660, '279', 'สดมภ์', 'lesson-11', 10, 2545, 'video', 'https://player.mediadelivery.net/play/618924/fdf3e7b3-508e-488d-9e04-154d79144c07', 'unknown', NULL, 1, '2026-02-18 04:26:25.189', '2026-02-18 04:26:25.189'),
(4898, 660, '1942', 'ข้อสอบจริงท้องถิ่น ข้อที่ 30-32', 'lesson-12', 11, 991, 'video', 'https://player.mediadelivery.net/play/618924/d1f1f52c-b622-443a-ad98-924cad237422', 'unknown', NULL, 1, '2026-02-18 04:26:25.189', '2026-02-18 04:26:25.189'),
(4899, 661, '281', 'หลักภาษา', 'lesson-1', 0, 2623, 'video', 'https://player.mediadelivery.net/play/618924/74d72e44-6d81-4258-be64-60db661ea680', 'unknown', NULL, 1, '2026-02-18 04:26:25.190', '2026-02-18 04:26:25.190'),
(4900, 661, '282', 'ประโยคในภาษาไทย', 'lesson-2', 1, 549, 'video', 'https://player.mediadelivery.net/play/618924/01097719-3da9-47d8-9f4b-075a478a52ac', 'unknown', NULL, 1, '2026-02-18 04:26:25.190', '2026-02-18 04:26:25.190'),
(4901, 661, '283', 'คำราชาศัพท์', 'lesson-3', 2, 1061, 'video', 'https://player.mediadelivery.net/play/618924/fbbc022b-1512-4e5a-8a71-fc8778ed53e2', 'unknown', NULL, 1, '2026-02-18 04:26:25.191', '2026-02-18 04:26:25.191'),
(4902, 661, '284', 'คำสุภาษิต', 'lesson-4', 3, 342, 'video', 'https://player.mediadelivery.net/play/618924/137216d0-6331-4e87-b569-fc1f14ac6b6f', 'unknown', NULL, 1, '2026-02-18 04:26:25.191', '2026-02-18 04:26:25.191'),
(4903, 661, '285', 'ระดับภาษา', 'lesson-5', 4, 1040, 'video', 'https://player.mediadelivery.net/play/618924/90a03afb-ed86-4313-9452-72eb636beceb', 'unknown', NULL, 1, '2026-02-18 04:26:25.191', '2026-02-18 04:26:25.191'),
(4904, 661, '286', 'อุปมาอุปไมย', 'lesson-6-2', 5, 1570, 'video', 'https://player.mediadelivery.net/play/618924/44eea076-c15f-4288-9b5a-d4e1b1161617', 'unknown', NULL, 1, '2026-02-18 04:26:25.192', '2026-02-18 04:26:25.192'),
(4905, 661, '287', 'การเลือกใช้คำหรือกลุ่มให้ถูกต้องตามบริบท', 'lesson-7-2', 6, 296, 'video', 'https://player.mediadelivery.net/play/618924/cafdd875-5d4a-4b57-b96b-b0bded060e17', 'unknown', NULL, 1, '2026-02-18 04:26:25.192', '2026-02-18 04:26:25.192'),
(4906, 661, '288', 'การใช้ภาษาไทยให้ถูกต้องรัดกุมตามบริบทและความหมาย (ข้อบกพร่องในการใช้ภาษา)', 'lesson-8-2', 7, 866, 'video', 'https://player.mediadelivery.net/play/618924/3823964c-ca31-4b73-ae53-4fe2df1cca77', 'unknown', NULL, 1, '2026-02-18 04:26:25.192', '2026-02-18 04:26:25.192'),
(4907, 661, '289', 'การเรียบเรียงประโยค', 'lesson-9-2', 8, 632, 'video', 'https://player.mediadelivery.net/play/618924/8c316358-65bb-4513-9979-247b06599d64', 'unknown', NULL, 1, '2026-02-18 04:26:25.193', '2026-02-18 04:26:25.193'),
(4908, 661, '290', 'การอ่านบทความ', 'lesson-10-2', 9, 412, 'video', 'https://player.mediadelivery.net/play/618924/a1ab46a2-d0aa-45fc-99b6-e97f81d2567a', 'unknown', NULL, 1, '2026-02-18 04:26:25.193', '2026-02-18 04:26:25.193'),
(4909, 661, '291', 'เงื่อนไขทางภาษา', 'lesson-11-2', 10, 494, 'video', 'https://player.mediadelivery.net/play/618924/2bfc3338-caf7-4293-a681-7464ef621079', 'unknown', NULL, 1, '2026-02-18 04:26:25.193', '2026-02-18 04:26:25.193'),
(4910, 662, '296', 'Introduction', 'introduction', 0, 265, 'video', 'https://player.mediadelivery.net/play/618924/d223c444-03fa-4de1-876b-fd0bff2003a8', 'unknown', NULL, 1, '2026-02-18 04:26:25.194', '2026-02-18 04:26:25.194'),
(4911, 662, '298', 'เทคนิคการทำข้อสอบ CONVERSATION 01', 'conversation-01', 1, 1337, 'video', 'https://player.mediadelivery.net/play/618924/96aff09e-842f-4e52-aa58-14dac85fcf99', 'unknown', NULL, 1, '2026-02-18 04:26:25.194', '2026-02-18 04:26:25.194'),
(4912, 662, '299', 'เทคนิคการทำข้อสอบ CONVERSATION 02', 'conversation-02', 2, 931, 'video', 'https://player.mediadelivery.net/play/618924/5c37f7de-85a1-4af2-8260-3c1c7207bea3', 'unknown', NULL, 1, '2026-02-18 04:26:25.195', '2026-02-18 04:26:25.195'),
(4913, 662, '300', 'เทคนิคการทำข้อสอบ CONVERSATION 03', 'conversation-03', 3, 2928, 'video', 'https://player.mediadelivery.net/play/618924/c8d2f92f-b8c8-4602-8e9e-0abe1096d3f9', 'unknown', NULL, 1, '2026-02-18 04:26:25.196', '2026-02-18 04:26:25.196'),
(4914, 662, '301', 'เทคนิคการทำข้อสอบ CONVERSATION 04', 'conversation-04', 4, 1173, 'video', 'https://player.mediadelivery.net/play/618924/6046b6a3-499f-4cd2-9ee8-be6f4069403d', 'unknown', NULL, 1, '2026-02-18 04:26:25.197', '2026-02-18 04:26:25.197'),
(4915, 662, '302', 'เทคนิคการทำข้อสอบ VOCABULARY 01', 'vocabulary-01', 5, 876, 'video', 'https://player.mediadelivery.net/play/618924/91094554-f67d-4fd4-97e4-7a02962bc992', 'unknown', NULL, 1, '2026-02-18 04:26:25.198', '2026-02-18 04:26:25.198'),
(4916, 662, '303', 'เทคนิคการทำข้อสอบ VOCABULARY 02', 'vocabulary-02', 6, 1118, 'video', 'https://player.mediadelivery.net/play/618924/7b36167b-f2c6-4df0-bddb-b38c7f900075', 'unknown', NULL, 1, '2026-02-18 04:26:25.198', '2026-02-18 04:26:25.198'),
(4917, 662, '304', 'เทคนิคการทำข้อสอบ STRUCTURE 01', 'structure-01', 7, 971, 'video', 'https://player.mediadelivery.net/play/618924/2806aeec-d1a4-4078-a36f-91d749e60e0c', 'unknown', NULL, 1, '2026-02-18 04:26:25.199', '2026-02-18 04:26:25.199'),
(4918, 662, '305', 'เทคนิคการทำข้อสอบ STRUCTURE 02', 'structure-02', 8, 1617, 'video', 'https://player.mediadelivery.net/play/618924/222a108e-ab23-4cec-83ad-27b56a6f90f6', 'unknown', NULL, 1, '2026-02-18 04:26:25.200', '2026-02-18 04:26:25.200'),
(4919, 662, '306', 'เทคนิคการทำข้อสอบ STRUCTURE 03', 'structure-03', 9, 3159, 'video', 'https://player.mediadelivery.net/play/618924/b46d140d-022f-4914-8acc-5b8f7c5a176f', 'unknown', NULL, 1, '2026-02-18 04:26:25.201', '2026-02-18 04:26:25.201'),
(4920, 662, '307', 'เทคนิคการทำข้อสอบ STRUCTURE 04', 'structure-04', 10, 1400, 'video', 'https://player.mediadelivery.net/play/618924/79683a02-3463-4a9a-ac29-f1df2f3d88de', 'unknown', NULL, 1, '2026-02-18 04:26:25.201', '2026-02-18 04:26:25.201'),
(4921, 662, '308', 'วิธีการทำข้อสอบ READING', 'reading', 11, 1523, 'video', 'https://player.mediadelivery.net/play/618924/e2198679-0be2-437d-8a59-31ba087bcf97', 'unknown', NULL, 1, '2026-02-18 04:26:25.201', '2026-02-18 04:26:25.201'),
(4922, 662, '309', 'เฉลยข้อสอบท้องถิ่นอย่างละเอียด วิชา ภาษาอังกฤษ 01', 'lesson-13', 12, 1297, 'video', 'https://player.mediadelivery.net/play/618924/3c9189fd-73f3-4eb8-bea9-590ccb966854', 'unknown', NULL, 1, '2026-02-18 04:26:25.201', '2026-02-18 04:26:25.201'),
(4923, 662, '310', 'เฉลยข้อสอบท้องถิ่นอย่างละเอียด วิชา ภาษาอังกฤษ 02', '2', 13, 55, 'video', 'https://player.mediadelivery.net/play/618924/c30a4ca0-6b0e-4843-b9d8-f63fd6d42db2', 'unknown', NULL, 1, '2026-02-18 04:26:25.202', '2026-02-18 04:26:25.202'),
(4924, 662, '311', 'เฉลยข้อสอบท้องถิ่นอย่างละเอียด วิชา ภาษาอังกฤษ 03', '3', 14, 1806, 'video', 'https://player.mediadelivery.net/play/618924/e3e40dc4-660a-436d-9701-de4cad1d409c', 'unknown', NULL, 1, '2026-02-18 04:26:25.202', '2026-02-18 04:26:25.202'),
(4925, 662, '312', 'Special', 'special', 15, 532, 'video', 'https://player.mediadelivery.net/play/618924/82b13aa4-fc47-41b5-b093-89d217371c69', 'unknown', NULL, 1, '2026-02-18 04:26:25.202', '2026-02-18 04:26:25.202'),
(4926, 663, '314', 'รัฐธรรมนูญแห่งราชอาณาจักรไทย พ.ศ.2560', 'lesson-1-2', 0, 2354, 'video', 'https://player.mediadelivery.net/play/618924/b089a668-c84c-4658-87ed-d68bc62e3747', 'unknown', NULL, 1, '2026-02-18 04:26:25.203', '2026-02-18 04:26:25.203'),
(4927, 663, '315', 'พ.ร.บ.ระเบียบบริหารราชการแผ่นดิน พ.ศ.2534', 'lesson-2-2', 1, 3665, 'video', 'https://player.mediadelivery.net/play/618924/f1c21fbb-2303-45d4-b653-ca2c1bfdc925', 'unknown', NULL, 1, '2026-02-18 04:26:25.203', '2026-02-18 04:26:25.203'),
(4928, 663, '316', 'พื้นฐานกฎหมายส่วนท้องถิ่น', 'lesson-3-2', 2, 2598, 'video', 'https://player.mediadelivery.net/play/618924/3c525a95-ff47-46b7-9c7a-8bef7a5b1d22', 'unknown', NULL, 1, '2026-02-18 04:26:25.203', '2026-02-18 04:26:25.203'),
(4929, 663, '317', 'พ.ร.บ.องค์การบริหารส่วนจังหวัด พ.ศ.2540', 'lesson-4-2', 3, 3505, 'video', 'https://player.mediadelivery.net/play/618924/602d0714-416e-4070-b54e-06574af9ced0', 'unknown', NULL, 1, '2026-02-18 04:26:25.204', '2026-02-18 04:26:25.204'),
(4930, 663, '318', 'พ.ร.บ.สภาตำบลและองค์การบริหารส่วนตำบล พ.ศ.2537', 'lesson-5-2', 4, 3981, 'video', 'https://player.mediadelivery.net/play/618924/549780fe-0d51-42b2-873c-787530932142', 'unknown', NULL, 1, '2026-02-18 04:26:25.204', '2026-02-18 04:26:25.204'),
(4931, 663, '319', 'พ.ร.บ.ระเบียบบริหารราชการเมืองพัทยา พ.ศ.2542', '2-2', 5, 3278, 'video', 'https://player.mediadelivery.net/play/618924/a173e933-dd81-44eb-980c-17e2dc8a6dfa', 'unknown', NULL, 1, '2026-02-18 04:26:25.204', '2026-02-18 04:26:25.204'),
(4932, 663, '320', 'พ.ร.บ.ระเบียบบริหารงานบุคคลส่วนส่วนท้องถิ่น พ.ศ.2542', 'lesson-7-2-3', 6, 3151, 'video', 'https://player.mediadelivery.net/play/618924/6b924d0b-460b-4ba2-abe0-c5588bb847b7', 'unknown', NULL, 1, '2026-02-18 04:26:25.205', '2026-02-18 04:26:25.205'),
(4933, 663, '321', 'ความรู้เพิ่มเติมเกี่ยวกับข้าราชการไทย', 'lesson-8-2-3', 7, 1110, 'video', 'https://player.mediadelivery.net/play/618924/32bbf332-c420-4ae7-b257-4c6e08a09633', 'unknown', NULL, 1, '2026-02-18 04:26:25.205', '2026-02-18 04:26:25.205'),
(4934, 663, '322', 'พ.ร.บ.กำหนดแผนและขั้นตอนการกระจายอำนาจให้แก่องค์กรปกครองส่วนท้องถิ่น พ.ศ.2542', 'lesson-9-2-3', 8, 1956, 'video', 'https://player.mediadelivery.net/play/618924/86f57913-c108-432d-ac53-2fa20ae209bc', 'unknown', NULL, 1, '2026-02-18 04:26:25.206', '2026-02-18 04:26:25.206'),
(4935, 663, '323', 'พ.ร.บ.การอำนวยความสะดวกในการพิจารณาอนุญาตทางราชการ พ.ศ.2558', 'lesson-10-2-3', 9, 1826, 'video', 'https://player.mediadelivery.net/play/618924/e3a3fcba-e75e-44d3-ad68-3ed31fa19480', 'unknown', NULL, 1, '2026-02-18 04:26:25.206', '2026-02-18 04:26:25.206'),
(4936, 663, '324', 'พ.ร.บ. ว่าด้วยหลักเกณฑ์และวิธีการบริหารกิจการบ้านเมืองที่ดีพ.ศ.2546และแก้ไขเพิ่มเติม พ.ศ.2562', 'lesson-11-2-3', 10, 3738, 'video', 'https://player.mediadelivery.net/play/618924/a7bb2f0d-b728-4b05-b743-9f5adbc39c51', 'unknown', NULL, 1, '2026-02-18 04:26:25.206', '2026-02-18 04:26:25.206'),
(4937, 663, '325', 'ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ.2526', 'lesson-12-2', 11, 1875, 'video', 'https://player.mediadelivery.net/play/618924/860ed4fe-d6ca-49ec-ae8a-6557e46d2fba', 'unknown', NULL, 1, '2026-02-18 04:26:25.206', '2026-02-18 04:26:25.206'),
(4938, 663, '326', 'พ.ร.บ.เทศบาล พ.ศ.2496', '2496', 12, 3594, 'video', 'https://player.mediadelivery.net/play/618924/5dc67341-4e5b-4bcb-b39a-0c2fa115bc71', 'unknown', NULL, 1, '2026-02-18 04:26:25.207', '2026-02-18 04:26:25.207'),
(4939, 663, '508', 'พรบ.วิธีปฏิบัติราชการทางปกครอง', '4', 13, 4979, 'video', 'https://player.mediadelivery.net/play/618924/645483b8-b743-4366-9d59-11f056df2029', 'unknown', NULL, 1, '2026-02-18 04:26:25.207', '2026-02-18 04:26:25.207'),
(4940, 663, '509', 'พรบ.มาตรฐานทางจริยธรรม', 'lesson-15', 14, 5081, 'video', 'https://player.mediadelivery.net/play/618924/3b3368ae-bec7-4c6d-8502-34ae313b022a', 'unknown', NULL, 1, '2026-02-18 04:26:25.207', '2026-02-18 04:26:25.207'),
(4941, 663, '327', 'ข้อสอบพร้อมเฉลย ชุดที่1', '1', 15, 2740, 'video', 'https://player.mediadelivery.net/play/618924/3703ff1d-1bde-458c-b6d2-25d8bf34bd97', 'unknown', NULL, 1, '2026-02-18 04:26:25.208', '2026-02-18 04:26:25.208'),
(4942, 663, '328', 'ข้อสอบพร้อมเฉลย ชุดที่2', '2-2-3', 16, 2880, 'video', 'https://player.mediadelivery.net/play/618924/208dbd08-a923-4a34-9dfa-e2cb936b9f26', 'unknown', NULL, 1, '2026-02-18 04:26:25.208', '2026-02-18 04:26:25.208'),
(4943, 663, '329', 'ข้อสอบพร้อมเฉลย ชุดที่3', '3-2', 17, 2866, 'video', 'https://player.mediadelivery.net/play/618924/060d7dfa-a285-4543-878e-dcf815b001bc', 'unknown', NULL, 1, '2026-02-18 04:26:25.208', '2026-02-18 04:26:25.208'),
(4944, 664, '4276', 'รวมพระราชบัญญัติ และกฏหมายฉบับเต็ม 13 ฉบับ', 'lesson-1-2-3', 0, NULL, 'video', 'https://jknowledgetutor.com/local_law_13/', 'unknown', NULL, 1, '2026-02-18 04:26:25.210', '2026-02-18 04:26:25.210'),
(4945, 665, '4279', 'ชุดข้อสอบจำลองเสมือนจริง ข้อสอบท้องถิ่น J ท้องถิ่น TEST by J ก.พ. tutor', '2-2-3-4', 0, NULL, 'video', 'https://forms.gle/P1NaWZcsHiZZZNQ47 ', 'unknown', NULL, 1, '2026-02-18 04:26:25.211', '2026-02-18 04:26:25.211'),
(4946, 666, '4283', 'สรุปเนื้อหาพระราชบัญญัติมาตรฐานทางจริยธรรม 2562', '2562', 0, 5081, 'video', 'https://player.mediadelivery.net/play/618924/cb7f5933-b0de-4bc9-8642-2c3836551be5', 'unknown', NULL, 1, '2026-02-18 04:26:25.211', '2026-02-18 04:26:25.211'),
(4947, 666, '3c047741-8015-49af-8e75-9b2c32876b1b', 'สรุปเนื้อหาพระราชบัญญัติวิธีปฏิบัติราชการทางปกครอง 2539', '2539', 1, NULL, 'video', 'https://player.mediadelivery.net/play/618924/cb7f5933-b0de-4bc9-8642-2c3836551be5', 'unknown', NULL, 1, '2026-02-18 04:26:25.212', '2026-02-18 04:26:25.212'),
(4948, 667, '4988', 'กฎหมายสำหรับสอบภาค ข ทุกตำแหน่ง', 'lesson-1-2-3-4', 0, NULL, 'video', 'https://jknowledgetutor.com/local-informations/', 'unknown', NULL, 1, '2026-02-18 04:26:25.212', '2026-02-18 04:26:25.212'),
(5122, 689, '1372', 'วิชาฟิสิกส์ ข้อ1-3', '1-3-2', 0, 1350, 'video', 'https://player.vimeo.com/video/1079740642', 'unknown', NULL, 1, '2026-02-18 04:36:40.945', '2026-02-18 04:36:40.945'),
(5123, 689, '1373', 'วิชาฟิสิกส์ ข้อ4-6', '4-6-2', 1, 1902, 'video', 'https://player.vimeo.com/video/1079740914', 'unknown', NULL, 1, '2026-02-18 04:36:40.945', '2026-02-18 04:36:40.945'),
(5124, 689, '1374', 'วิชาฟิสิกส์ ข้อ7-10', '7-10-2', 2, 2455, 'video', 'https://player.vimeo.com/video/1079741214', 'unknown', NULL, 1, '2026-02-18 04:36:40.945', '2026-02-18 04:36:40.945'),
(5125, 689, '1375', 'วิชาฟิสิกส์ ข้อ11-15', '11-15-3', 3, 2268, 'video', 'https://player.vimeo.com/video/1079741638', 'unknown', NULL, 1, '2026-02-18 04:36:40.946', '2026-02-18 04:36:40.946'),
(5126, 689, '1376', 'วิชาฟิสิกส์ ข้อ16-20', '16-20-3', 4, 2315, 'video', 'https://player.vimeo.com/video/1079742210', 'unknown', NULL, 1, '2026-02-18 04:36:40.946', '2026-02-18 04:36:40.946'),
(5127, 689, '1377', 'วิชาฟิสิกส์ ข้อ21-25', '21-25-2', 5, 1664, 'video', 'https://player.vimeo.com/video/1079742591', 'unknown', NULL, 1, '2026-02-18 04:36:40.947', '2026-02-18 04:36:40.947'),
(5128, 689, '1378', 'วิชาฟิสิกส์ ข้อ26-30', '26-30-2', 6, 2419, 'video', 'https://player.vimeo.com/video/1079742938', 'unknown', NULL, 1, '2026-02-18 04:36:40.947', '2026-02-18 04:36:40.947'),
(5129, 690, '1380', 'วิชาชีววิทยา ข้อ1-10', '1-10-2', 0, 3108, 'video', 'https://player.vimeo.com/video/1079738274', 'unknown', NULL, 1, '2026-02-18 04:36:40.948', '2026-02-18 04:36:40.948'),
(5130, 690, '1381', 'วิชาชีววิทยา ข้อ11-15', '11-15-3-2', 1, 3014, 'video', 'https://player.vimeo.com/video/1079738639', 'unknown', NULL, 1, '2026-02-18 04:36:40.948', '2026-02-18 04:36:40.948'),
(5131, 690, '1382', 'วิชาชีววิทยา ข้อ16-20', '16-20-3-2', 2, 2082, 'video', 'https://player.vimeo.com/video/1079739155', 'unknown', NULL, 1, '2026-02-18 04:36:40.948', '2026-02-18 04:36:40.948'),
(5132, 690, '1383', 'วิชาชีววิทยา ข้อ21-30', '21-30-3', 3, 2727, 'video', 'https://player.vimeo.com/video/1079739606', 'unknown', NULL, 1, '2026-02-18 04:36:40.949', '2026-02-18 04:36:40.949'),
(5133, 690, '1384', 'วิชาชีววิทยา ข้อ31-40', '31-40-2', 4, 2895, 'video', 'https://player.vimeo.com/video/1079740141', 'unknown', NULL, 1, '2026-02-18 04:36:40.950', '2026-02-18 04:36:40.950'),
(5134, 691, '1386', 'วิชาคณิตศาสตร์ ข้อ1-5', '1-5-2', 0, 2481, 'video', 'https://player.vimeo.com/video/1079748138', 'unknown', NULL, 1, '2026-02-18 04:36:40.951', '2026-02-18 04:36:40.951'),
(5135, 691, '1387', 'วิชาคณิตศาสตร์ ข้อ6-10', '6-10-2', 1, 2702, 'video', 'https://player.vimeo.com/video/1079748382', 'unknown', NULL, 1, '2026-02-18 04:36:40.951', '2026-02-18 04:36:40.951'),
(5136, 691, '1388', 'วิชาคณิตศาสตร์ ข้อ11-15', '11-15-2', 2, 2815, 'video', 'https://player.vimeo.com/video/1079748590', 'unknown', NULL, 1, '2026-02-18 04:36:40.952', '2026-02-18 04:36:40.952'),
(5137, 691, '1389', 'วิชาคณิตศาสตร์ ข้อ16-20', '16-20-2', 3, 2481, 'video', 'https://player.vimeo.com/video/1079749053', 'unknown', NULL, 1, '2026-02-18 04:36:40.952', '2026-02-18 04:36:40.952'),
(5138, 691, '1390', 'วิชาคณิตศาสตร์ ข้อ21-25', '21-25-2-2', 4, 1865, 'video', 'https://player.vimeo.com/video/1079749270', 'unknown', NULL, 1, '2026-02-18 04:36:40.952', '2026-02-18 04:36:40.952'),
(5139, 691, '1391', 'วิชาคณิตศาสตร์ ข้อ26-30', '26-30-2-2', 5, 1974, 'video', 'https://player.vimeo.com/video/1079749476', 'unknown', NULL, 1, '2026-02-18 04:36:40.953', '2026-02-18 04:36:40.953'),
(5140, 692, '1395', 'วิชาภาษาไทย ข้อ1-10', '1-10-2-2', 0, 4760, 'video', 'https://player.vimeo.com/video/1079745642', 'unknown', NULL, 1, '2026-02-18 04:36:40.953', '2026-02-18 04:36:40.953'),
(5141, 692, '1396', 'วิชาภาษาไทย ข้อ11-20', '11-20-2', 1, 3729, 'video', 'https://player.vimeo.com/video/1079745929', 'unknown', NULL, 1, '2026-02-18 04:36:40.954', '2026-02-18 04:36:40.954'),
(5142, 692, '1397', 'วิชาภาษาไทย ข้อ21-30', '21-30-4', 2, 2928, 'video', 'https://player.vimeo.com/video/1079746303', 'unknown', NULL, 1, '2026-02-18 04:36:40.954', '2026-02-18 04:36:40.954'),
(5143, 692, '1398', 'วิชาภาษาไทย ข้อ31-40', '31-40-2-2', 3, 2795, 'video', 'https://player.vimeo.com/video/1079746469', 'unknown', NULL, 1, '2026-02-18 04:36:40.955', '2026-02-18 04:36:40.955'),
(5144, 692, '18379', 'ภาษาไทย (รอบพิมพ์เดือนสิงหาคม 2568 เป็นต้นไป) ข้อ 1-10', 'lesson-5', 4, 1636, 'video', 'https://player.vimeo.com/video/1162383644?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:36:40.955', '2026-02-18 04:36:40.955'),
(5145, 692, '18380', 'ภาษาไทย (รอบพิมพ์เดือนสิงหาคม 2568 เป็นต้นไป) ข้อ 11-20', '2', 5, 1165, 'video', 'https://player.vimeo.com/video/1162383977?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:36:40.955', '2026-02-18 04:36:40.955'),
(5146, 692, '18381', 'ภาษาไทย (รอบพิมพ์เดือนสิงหาคม 2568 เป็นต้นไป) ข้อ 21-30', '3', 6, 1240, 'video', 'https://player.vimeo.com/video/1162383704?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:36:40.956', '2026-02-18 04:36:40.956'),
(5147, 692, '18382', 'ภาษาไทย (รอบพิมพ์เดือนสิงหาคม 2568 เป็นต้นไป) ข้อ 31-40', '4', 7, 1147, 'video', 'https://player.vimeo.com/video/1162383496?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:36:40.956', '2026-02-18 04:36:40.956'),
(5148, 692, '18383', 'ภาษาไทย (รอบพิมพ์เดือนสิงหาคม 2568 เป็นต้นไป) ข้อ 41-50', '5', 8, 975, 'video', 'https://player.vimeo.com/video/1162383919?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:36:40.956', '2026-02-18 04:36:40.956'),
(5149, 693, '1400', 'วิชาภาษาอังกฤษ ข้อ1-12', '1-12', 0, 1816, 'video', 'https://player.vimeo.com/video/1079747681?share=copy', 'unknown', NULL, 1, '2026-02-18 04:36:40.957', '2026-02-18 04:36:40.957'),
(5150, 693, '1401', 'วิชาภาษาอังกฤษ ข้อ13-26', '13-26', 1, 2352, 'video', 'https://player.vimeo.com/video/1079747817?share=copy', 'unknown', NULL, 1, '2026-02-18 04:36:40.957', '2026-02-18 04:36:40.957'),
(5151, 693, '1402', 'วิชาภาษาอังกฤษ ข้อ27-32', '27-32', 2, 1394, 'video', 'https://player.vimeo.com/video/1079748018?share=copy', 'unknown', NULL, 1, '2026-02-18 04:36:40.957', '2026-02-18 04:36:40.957'),
(5152, 693, '1403', 'วิชาภาษาอังกฤษ ข้อ33-38', '33-38', 3, 1427, 'video', 'https://player.vimeo.com/video/1079746738?share=copy', 'unknown', NULL, 1, '2026-02-18 04:36:40.958', '2026-02-18 04:36:40.958'),
(5153, 693, '1404', 'วิชาภาษาอังกฤษ ข้อ39-52', '39-52', 4, 2873, 'video', 'https://player.vimeo.com/video/1079746848?share=copy', 'unknown', NULL, 1, '2026-02-18 04:36:40.958', '2026-02-18 04:36:40.958'),
(5154, 693, '1405', 'วิชาภาษาอังกฤษ ข้อ53-60', '53-60', 5, 2215, 'video', 'https://player.vimeo.com/video/1079747081?share=copy', 'unknown', NULL, 1, '2026-02-18 04:36:40.958', '2026-02-18 04:36:40.958'),
(5155, 693, '1406', 'วิชาภาษาอังกฤษ ข้อ61-65', '61-65', 6, 1107, 'video', 'https://player.vimeo.com/video/1079747286?share=copy', 'unknown', NULL, 1, '2026-02-18 04:36:40.959', '2026-02-18 04:36:40.959'),
(5156, 693, '1408', 'วิชาภาษาอังกฤษ ข้อ66-70', '66-70', 7, 1223, 'video', 'https://player.vimeo.com/video/1079747434?share=copy', 'unknown', NULL, 1, '2026-02-18 04:36:40.959', '2026-02-18 04:36:40.959'),
(5157, 693, '1409', 'วิชาภาษาอังกฤษ ข้อ78-80', '78-80', 8, 1311, 'video', 'https://player.vimeo.com/video/1079747552?share=copy', 'unknown', NULL, 1, '2026-02-18 04:36:40.959', '2026-02-18 04:36:40.959'),
(5158, 694, '1411', 'วิชาสัมคมศึกษา ข้อ1-10', '1-10', 0, 1721, 'video', 'https://player.vimeo.com/video/1079743568?share=copy', 'unknown', NULL, 1, '2026-02-18 04:36:40.960', '2026-02-18 04:36:40.960'),
(5159, 694, '1412', 'วิชาสัมคมศึกษา ข้อ11-20', '11-20', 1, 2366, 'video', 'https://player.vimeo.com/video/1079743847?share=copy', 'unknown', NULL, 1, '2026-02-18 04:36:40.960', '2026-02-18 04:36:40.960'),
(5160, 694, '1413', 'วิชาสัมคมศึกษา ข้อ21-30', '21-30', 2, 2736, 'video', 'https://player.vimeo.com/video/1079744444?share=copy', 'unknown', NULL, 1, '2026-02-18 04:36:40.961', '2026-02-18 04:36:40.961'),
(5161, 694, '1414', 'วิชาสัมคมศึกษา ข้อ31-40', '31-40', 3, 3114, 'video', 'https://player.vimeo.com/video/1079744937?share=copy', 'unknown', NULL, 1, '2026-02-18 04:36:40.964', '2026-02-18 04:36:40.964'),
(5162, 694, '1415', 'วิชาสัมคมศึกษา ข้อ41-50', '41-50', 4, 2115, 'video', 'https://player.vimeo.com/video/1079745379?share=copy', 'unknown', NULL, 1, '2026-02-18 04:36:40.964', '2026-02-18 04:36:40.964'),
(5163, 694, '18396', 'สังคมศึกษา (รอบพิมพ์เดือนสิงหาคม 2568 เป็นต้นไป) ข้อ 1-10', 'lesson-6', 5, 3325, 'video', 'https://player.vimeo.com/video/1162456777?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:36:40.965', '2026-02-18 04:36:40.965'),
(5164, 694, '18397', 'สังคมศึกษา (รอบพิมพ์เดือนสิงหาคม 2568 เป็นต้นไป) ข้อ 11-20', '2-2', 6, 2374, 'video', 'https://player.vimeo.com/video/1162458312?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:36:40.965', '2026-02-18 04:36:40.965'),
(5165, 694, '18398', 'สังคมศึกษา (รอบพิมพ์เดือนสิงหาคม 2568 เป็นต้นไป) ข้อ 21-30', '3-2', 7, 2210, 'video', 'https://player.vimeo.com/video/1162457722?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:36:40.965', '2026-02-18 04:36:40.965'),
(5166, 694, '18399', 'สังคมศึกษา (รอบพิมพ์เดือนสิงหาคม 2568 เป็นต้นไป) ข้อ 31-40', '4-2', 8, 1646, 'video', 'https://player.vimeo.com/video/1162458986?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:36:40.966', '2026-02-18 04:36:40.966'),
(5167, 694, '18400', 'สังคมศึกษา (รอบพิมพ์เดือนสิงหาคม 2568 เป็นต้นไป) ข้อ 41-50', '5-2', 9, 1440, 'video', 'https://player.vimeo.com/video/1162455904?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:36:40.966', '2026-02-18 04:36:40.966'),
(5168, 695, '2516', 'ข้อที่1-5', '1-5', 0, 2215, 'video', 'https://player.vimeo.com/video/1115707915?share=copy', 'unknown', NULL, 1, '2026-02-18 04:36:40.967', '2026-02-18 04:36:40.967'),
(5169, 695, '2517', 'ข้อที่6-10', '6-10', 1, 2050, 'video', 'https://player.vimeo.com/video/1115707988?share=copy', 'unknown', NULL, 1, '2026-02-18 04:36:40.967', '2026-02-18 04:36:40.967'),
(5170, 695, '2518', 'ข้อที่11-15', '11-15', 2, 2313, 'video', 'https://player.vimeo.com/video/1115707684?share=copy', 'unknown', NULL, 1, '2026-02-18 04:36:40.968', '2026-02-18 04:36:40.968'),
(5171, 695, '2519', 'ข้อที่16-20', '16-20', 3, 2133, 'video', 'https://player.vimeo.com/video/1115708050?share=copy', 'unknown', NULL, 1, '2026-02-18 04:36:40.968', '2026-02-18 04:36:40.968'),
(5172, 695, '2520', 'ข้อที่21-25', '21-25', 4, 2108, 'video', 'https://player.vimeo.com/video/1115707865?share=copy', 'unknown', NULL, 1, '2026-02-18 04:36:40.969', '2026-02-18 04:36:40.969'),
(5173, 695, '2521', 'ข้อที่26-30', '26-30', 5, 1886, 'video', 'https://player.vimeo.com/video/1115707778?share=copy', 'unknown', NULL, 1, '2026-02-18 04:36:40.969', '2026-02-18 04:36:40.969'),
(5174, 695, '2522', 'ข้อที่31-35', '31-35', 6, 2263, 'video', 'https://player.vimeo.com/video/1115707827?share=copy', 'unknown', NULL, 1, '2026-02-18 04:36:40.969', '2026-02-18 04:36:40.969'),
(5175, 696, '1294', 'เชาว์ปัญญา ข้อ1-5', '1-5', 0, 2599, 'video', 'https://player.vimeo.com/video/1078876369?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.814', '2026-02-18 04:38:48.814'),
(5176, 696, '1295', 'เชาว์ปัญญา ข้อ6-10', '6-10', 1, 1902, 'video', 'https://player.vimeo.com/video/1078876452?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.814', '2026-02-18 04:38:48.814'),
(5177, 696, '1296', 'เชาว์ปัญญา ข้อ11-20', '11-20', 2, 2157, 'video', 'https://player.vimeo.com/video/1078876507?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.815', '2026-02-18 04:38:48.815'),
(5178, 696, '1297', 'เชาว์ปัญญา ข้อ21-30', '21-30', 3, 2867, 'video', 'https://player.vimeo.com/video/1078876560?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.815', '2026-02-18 04:38:48.815'),
(5179, 696, '1298', 'เชาว์ปัญญา ข้อ30-35', '30-35', 4, 2867, 'video', 'https://player.vimeo.com/video/1078876560?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.816', '2026-02-18 04:38:48.816'),
(5180, 696, '1299', 'เชาว์ปัญญา ข้อ36-45', '36-45', 5, 2030, 'video', 'https://player.vimeo.com/video/1078876686?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.816', '2026-02-18 04:38:48.816'),
(5181, 696, '1300', 'เชื่อมโยง 1 ทริค EP.1', '1-ep-1', 6, 2574, 'video', 'https://player.vimeo.com/video/1078876719?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.816', '2026-02-18 04:38:48.816'),
(5182, 696, '1303', 'เชื่อมโยง 1 ทริค EP.2', '1-ep-2', 7, 3145, 'video', 'https://player.vimeo.com/video/1078876765?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.817', '2026-02-18 04:38:48.817'),
(5183, 696, '1301', 'เชื่อมโยง 2 EP.1', '2-ep-1', 8, 2186, 'video', 'https://player.vimeo.com/video/1078876802?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.817', '2026-02-18 04:38:48.817'),
(5184, 696, '1302', 'เชื่อมโยง 2 EP.2', '2-ep-2', 9, 2527, 'video', 'https://player.vimeo.com/video/1078876844?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.817', '2026-02-18 04:38:48.817'),
(5185, 696, '1304', 'จริยธรรม EP.1', 'ep-1', 10, 3869, 'video', 'https://player.vimeo.com/video/1078876895?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.818', '2026-02-18 04:38:48.818'),
(5186, 696, '1305', 'จริยธรรม EP.2', 'ep-2', 11, 3757, 'video', 'https://player.vimeo.com/video/1078876979?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.818', '2026-02-18 04:38:48.818'),
(5187, 696, '1307', 'จริยธรรม EP.3', 'ep-3', 12, 3861, 'video', 'https://player.vimeo.com/video/1078877222?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.819', '2026-02-18 04:38:48.819'),
(5188, 696, '1308', 'จริยธรรม EP.4', 'ep-4', 13, 3797, 'video', 'https://player.vimeo.com/video/1078877318?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.819', '2026-02-18 04:38:48.819'),
(5189, 697, '1311', 'วิชาคณิตศาสตร์ ข้อ1-5', '1-5-2', 0, 3037, 'video', 'https://player.vimeo.com/video/1092988743?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.820', '2026-02-18 04:38:48.820'),
(5190, 697, '1312', 'วิชาคณิตศาสตร์ ข้อ6-10', '6-10-2', 1, 2657, 'video', 'https://player.vimeo.com/video/1078887889?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.821', '2026-02-18 04:38:48.821'),
(5191, 697, '1313', 'วิชาคณิตศาสตร์ ข้อ11-15', '11-15', 2, 2493, 'video', 'https://player.vimeo.com/video/1078887973?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.821', '2026-02-18 04:38:48.821'),
(5192, 697, '1314', 'วิชาคณิตศาสตร์ ข้อ16-20', '16-20', 3, 2189, 'video', 'https://player.vimeo.com/video/1078888002?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.821', '2026-02-18 04:38:48.821'),
(5193, 697, '1315', 'วิชาคณิตศาสตร์ ข้อ21-25', '21-25', 4, 2372, 'video', 'https://player.vimeo.com/video/1078888067?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.822', '2026-02-18 04:38:48.822'),
(5194, 697, '1317', 'วิชาคณิตศาสตร์ ข้อ26-30', '26-30', 5, 2436, 'video', 'https://player.vimeo.com/video/1078888108?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.822', '2026-02-18 04:38:48.822'),
(5195, 698, '1319', 'วิชาฟิสิกส์ ข้อ1-3', '1-3', 0, 2435, 'video', 'https://player.vimeo.com/video/1078888108?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.823', '2026-02-18 04:38:48.823'),
(5196, 698, '1320', 'วิชาฟิสิกส์ ข้อ4-6', '4-6', 1, 1902, 'video', 'https://player.vimeo.com/video/1078878364?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.823', '2026-02-18 04:38:48.823'),
(5197, 698, '1321', 'วิชาฟิสิกส์ ข้อ7-10', '7-10', 2, 2455, 'video', 'https://player.vimeo.com/video/1078878530?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.824', '2026-02-18 04:38:48.824'),
(5198, 698, '1322', 'วิชาฟิสิกส์ ข้อ11-15', '11-15-2', 3, 1998, 'video', 'https://player.vimeo.com/video/1145821096?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:38:48.824', '2026-02-18 04:38:48.824'),
(5199, 698, '1323', 'วิชาฟิสิกส์ ข้อ16-20', '16-20-2', 4, 2318, 'video', 'https://player.vimeo.com/video/1078878675?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.825', '2026-02-18 04:38:48.825'),
(5200, 698, '1325', 'วิชาฟิสิกส์ ข้อ21-25', '21-25-2', 5, 1660, 'video', 'https://player.vimeo.com/video/1078878812?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.825', '2026-02-18 04:38:48.825'),
(5201, 698, '1326', 'วิชาฟิสิกส์ ข้อ26-30', '26-30-2', 6, 2420, 'video', 'https://player.vimeo.com/video/1078878853?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.826', '2026-02-18 04:38:48.826'),
(5202, 699, '1328', 'วิชาเคมี ข้อ1-10', '1-10', 0, 3171, 'video', 'https://player.vimeo.com/video/1078886407?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.827', '2026-02-18 04:38:48.827'),
(5203, 699, '1329', 'วิชาเคมี ข้อ11-15', '11-15-2-2', 1, 1784, 'video', 'https://player.vimeo.com/video/1078886464?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.827', '2026-02-18 04:38:48.827'),
(5204, 699, '1330', 'วิชาเคมี ข้อ16-20', '16-20-2-2', 2, 2103, 'video', 'https://player.vimeo.com/video/1078886566?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.828', '2026-02-18 04:38:48.828'),
(5205, 699, '1331', 'วิชาเคมี ข้อ21-25', '21-25-2-2', 3, 2209, 'video', 'https://player.vimeo.com/video/1078886627?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.828', '2026-02-18 04:38:48.828'),
(5206, 699, '1332', 'วิชาเคมี ข้อ26-30', '26-30-2-3', 4, 2664, 'video', 'https://player.vimeo.com/video/1078886653?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.829', '2026-02-18 04:38:48.829'),
(5207, 699, '1333', 'วิชาเคมี ข้อ31-35', '31-35', 5, 2277, 'video', 'https://player.vimeo.com/video/1078885744?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.829', '2026-02-18 04:38:48.829'),
(5208, 700, '1335', 'วิชาชีววิทยา ข้อ1-10', '1-10-2', 0, 3108, 'video', 'https://player.vimeo.com/video/1078887660?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.832', '2026-02-18 04:38:48.832'),
(5209, 700, '1336', 'วิชาชีววิทยา ข้อ11-15', '11-15-2-2-3', 1, 3014, 'video', 'https://player.vimeo.com/video/1078886925?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.832', '2026-02-18 04:38:48.832'),
(5210, 700, '1337', 'วิชาชีววิทยา ข้อ16-20', '16-20-2-2-3', 2, 2082, 'video', 'https://player.vimeo.com/video/1078886885?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.834', '2026-02-18 04:38:48.834'),
(5211, 700, '1338', 'วิชาชีววิทยา ข้อ21-30', '21-30-2', 3, 2727, 'video', 'https://player.vimeo.com/video/1078887565?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.836', '2026-02-18 04:38:48.836'),
(5212, 700, '1339', 'วิชาชีววิทยา ข้อ31-40', '31-40', 4, 2895, 'video', 'https://player.vimeo.com/video/1078887026?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.837', '2026-02-18 04:38:48.837'),
(5213, 701, '1343', 'วิชาภาษาไทย ข้อ1-10', '1-10-2-3', 0, 4759, 'video', 'https://player.vimeo.com/video/1092992951?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.838', '2026-02-18 04:38:48.838'),
(5214, 701, '1346', 'วิชาภาษาไทย ข้อ11-20', '11-20-2', 1, 3729, 'video', 'https://player.vimeo.com/video/1093006775?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.838', '2026-02-18 04:38:48.838'),
(5215, 701, '1344', 'วิชาภาษาไทย ข้อ21-30', '21-30-3', 2, 2928, 'video', 'https://player.vimeo.com/video/1078888515?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.838', '2026-02-18 04:38:48.838'),
(5216, 701, '1347', 'วิชาภาษาไทย ข้อ31-40', '31-40-2', 3, 2795, 'video', 'https://player.vimeo.com/video/1078888564?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.839', '2026-02-18 04:38:48.839'),
(5217, 701, '1348', 'วิชาภาษาไทย ข้อ41-50', '41-50', 4, 1602, 'video', 'https://player.vimeo.com/video/1078888706?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.839', '2026-02-18 04:38:48.839'),
(5218, 702, '1350', 'วิชาอังกฤษ ข้อ1-12', '1-12', 0, 1816, 'video', 'https://player.vimeo.com/video/1093008540?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.840', '2026-02-18 04:38:48.840'),
(5219, 702, '1352', 'วิชาอังกฤษ ข้อ13-26', '13-26', 1, 2351, 'video', 'https://player.vimeo.com/video/1078884410?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.840', '2026-02-18 04:38:48.840'),
(5220, 702, '1353', 'วิชาอังกฤษ ข้อ27-32', '27-32', 2, 1394, 'video', 'https://player.vimeo.com/video/1078884555?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.840', '2026-02-18 04:38:48.840'),
(5221, 702, '1354', 'วิชาอังกฤษ ข้อ33-38', '33-38', 3, NULL, 'video', 'https://player.vimeo.com/video/1078884618?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.841', '2026-02-18 04:38:48.841'),
(5222, 702, '1355', 'วิชาอังกฤษ ข้อ39-44', '39-44', 4, 895, 'video', 'https://player.vimeo.com/video/1078884659?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.841', '2026-02-18 04:38:48.841'),
(5223, 702, '1356', 'วิชาอังกฤษ ข้อ45-52', '45-52', 5, 1987, 'video', 'https://player.vimeo.com/video/1078884724?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.842', '2026-02-18 04:38:48.842'),
(5224, 702, '1358', 'วิชาอังกฤษ ข้อ53-60', '53-60', 6, 2215, 'video', 'https://player.vimeo.com/video/1093010872?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.842', '2026-02-18 04:38:48.842'),
(5225, 702, '1359', 'วิชาอังกฤษ ข้อ61-65', '61-65', 7, NULL, 'video', 'https://player.vimeo.com/video/1078884859?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.842', '2026-02-18 04:38:48.842'),
(5226, 702, '1360', 'วิชาอังกฤษ ข้อ66-70', '66-70', 8, NULL, 'video', 'https://player.vimeo.com/video/1078884906?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.843', '2026-02-18 04:38:48.843'),
(5227, 702, '1361', 'วิชาอังกฤษ ข้อ71-75', '71-75', 9, 842, 'video', 'https://player.vimeo.com/video/1078883996?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.843', '2026-02-18 04:38:48.843'),
(5228, 702, '1362', 'วิชาอังกฤษ ข้อ76-77', '76-77', 10, 1318, 'video', 'https://player.vimeo.com/video/1078884050?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.843', '2026-02-18 04:38:48.843'),
(5229, 702, '1363', 'วิชาอังกฤษ ข้อ78-80', '78-80', 11, NULL, 'video', 'https://player.vimeo.com/video/1078884089?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.844', '2026-02-18 04:38:48.844'),
(5230, 703, '1365', 'วิชาสังคมศึกษา ข้อ1-10', '1-10-2-3-4', 0, 1721, 'video', 'https://player.vimeo.com/video/1078878912?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.845', '2026-02-18 04:38:48.845'),
(5231, 703, '1366', 'วิชาสังคมศึกษา ข้อ11-20', '11-20-2-3', 1, 2366, 'video', 'https://player.vimeo.com/video/1078878962?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.845', '2026-02-18 04:38:48.845'),
(5232, 703, '1367', 'วิชาสังคมศึกษา ข้อ21-30', '21-30-2-3', 2, 2736, 'video', 'https://player.vimeo.com/video/1078879050?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.846', '2026-02-18 04:38:48.846'),
(5233, 703, '1368', 'วิชาสังคมศึกษา ข้อ41-50', '41-50-2', 3, NULL, 'video', 'https://player.vimeo.com/video/1078879406?share=copy', 'unknown', NULL, 1, '2026-02-18 04:38:48.846', '2026-02-18 04:38:48.846'),
(5234, 704, '14061', 'วิชาคณิคศาสตร์ EP.1 ข้อ 1-5', 'ep-1-1-5-2-8', 0, 2118, 'video', 'https://player.vimeo.com/video/1093048744?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:41:05.046', '2026-02-18 04:41:05.046'),
(5235, 704, '14062', 'วิชาคณิคศาสตร์ EP.2 ข้อ 6-10', 'ep-2-6-10-2-8', 1, 2392, 'video', 'https://player.vimeo.com/video/1093047885?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:41:05.047', '2026-02-18 04:41:05.047'),
(5236, 704, '14063', 'วิชาคณิคศาสตร์ EP.3 ข้อ 11-15', 'ep-3-11-15-2-8', 2, 1923, 'video', 'https://player.vimeo.com/video/1093048074?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:41:05.047', '2026-02-18 04:41:05.047'),
(5237, 704, '14064', 'วิชาคณิคศาสตร์ EP.4 ข้อ 16-20', 'ep-4-16-20-3', 3, 1364, 'video', 'https://player.vimeo.com/video/1162455821?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:41:05.047', '2026-02-18 04:41:05.047'),
(5238, 704, '14065', 'วิชาคณิคศาสตร์ EP.5 ข้อ 21-25', 'ep-5-21-25-2-8', 4, 1847, 'video', 'https://player.vimeo.com/video/1093047759?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:41:05.048', '2026-02-18 04:41:05.048'),
(5239, 704, '14066', 'วิชาคณิคศาสตร์ EP.6 ข้อ 26-30', 'ep-6-26-30-2-8', 5, 2502, 'video', 'https://player.vimeo.com/video/1093048663?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:41:05.048', '2026-02-18 04:41:05.048'),
(5240, 704, '18366', 'เฉลยแนวข้อสอบ-A-LEVEL-คณิตศาสตร์ประยุกต์_TCAS69', 'a-level-4', 6, NULL, 'video', NULL, NULL, NULL, 1, '2026-02-18 04:41:05.049', '2026-02-18 04:41:05.049'),
(5241, 705, '14068', 'ฟิสิกส์ EP.1 ข้อที่ 1-10', 'ep-1-1-10-2-8', 0, 3677, 'video', 'https://player.vimeo.com/video/1079693107?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:41:05.049', '2026-02-18 04:41:05.049'),
(5242, 705, '14069', 'ฟิสิกส์ EP.2 ข้อที่ 11-20', 'ep-2-11-20-2-8', 1, 3690, 'video', 'https://player.vimeo.com/video/1079693367?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:41:05.050', '2026-02-18 04:41:05.050'),
(5243, 705, '14070', 'ฟิสิกส์ EP.3 ข้อที่ 21-30', 'ep-3-21-30-2-8', 2, 2257, 'video', 'https://player.vimeo.com/video/1079693635?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:41:05.050', '2026-02-18 04:41:05.050'),
(5244, 705, '18367', 'เฉลยแนวข้อสอบ-A-LEVEL-ฟิสิกส์_TCAS69', 'a-level-tcas69-3', 3, NULL, 'video', NULL, NULL, NULL, 1, '2026-02-18 04:41:05.051', '2026-02-18 04:41:05.051'),
(5245, 706, '14072', 'เคมี EP.1 ข้อที่ 1-10', 'ep-1-1-10-2-8-2', 0, 3194, 'video', 'https://player.vimeo.com/video/1079692846?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:41:05.051', '2026-02-18 04:41:05.051'),
(5246, 706, '14073', 'เคมี EP.2 ข้อ 11 - 20', 'ep-2-11-20-2-8-2', 1, 2472, 'video', 'https://player.vimeo.com/video/1079692959?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:41:05.052', '2026-02-18 04:41:05.052'),
(5247, 706, '14074', 'เคมี EP.3 ข้อ 21-30', 'ep-3-21-30-2-8-2', 2, 2260, 'video', 'https://player.vimeo.com/video/1079692646?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:41:05.053', '2026-02-18 04:41:05.053'),
(5248, 706, '14075', 'เคมี EP.4 ข้อ 31-35', 'ep-4-31-35-2-8', 3, NULL, 'video', 'https://player.vimeo.com/video/1079692724?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:41:05.053', '2026-02-18 04:41:05.053'),
(5249, 706, '18368', 'เฉลยแนวข้อสอบ-A-LEVEL-เคมี_TCAS69', 'a-level-tcas69-3-2', 4, NULL, 'video', NULL, NULL, NULL, 1, '2026-02-18 04:41:05.055', '2026-02-18 04:41:05.055'),
(5250, 707, '14077', 'ชีววิทยา EP.1 ข้อที่ 1-10', 'ep-1-1-10-2-8-2-3', 0, 2676, 'video', 'https://player.vimeo.com/video/1079692513?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:41:05.056', '2026-02-18 04:41:05.056'),
(5251, 707, '14078', 'ชีววิทยา EP.2 ข้อที่ 11-20', 'ep-2-11-20-2-8-2-3', 1, 2627, 'video', 'https://player.vimeo.com/video/1079692169?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:41:05.056', '2026-02-18 04:41:05.056'),
(5252, 707, '14079', 'ชีววิทยา EP.3 ข้อที่ 21-30', 'ep-3-21-30-2-8-2-3', 2, NULL, 'video', 'https://player.vimeo.com/video/1079692272?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:41:05.056', '2026-02-18 04:41:05.056'),
(5253, 707, '14080', 'ชีววิทยา EP.4 ข้อที่ 31-40', 'ep-4-31-40-2-8', 3, NULL, 'video', 'https://player.vimeo.com/video/1079692366?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:41:05.057', '2026-02-18 04:41:05.057'),
(5254, 707, '18369', 'เฉลยแนวข้อสอบ-A-LEVEL-ชีววิทยา_TCAS69', 'a-level-2', 4, NULL, 'video', NULL, NULL, NULL, 1, '2026-02-18 04:41:05.057', '2026-02-18 04:41:05.057'),
(5255, 708, '1420', 'วิชาคณิตศาสตร์ ข้อ1-5', '1-5-3', 0, 2481, 'video', 'https://player.vimeo.com/video/1079699690?share=copy', 'unknown', NULL, 1, '2026-02-18 04:42:08.315', '2026-02-18 04:42:08.315'),
(5256, 708, '1421', 'วิชาคณิตศาสตร์ ข้อ6-10', '6-10-3', 1, 2702, 'video', 'https://player.vimeo.com/video/1079699489?share=copy', 'unknown', NULL, 1, '2026-02-18 04:42:08.317', '2026-02-18 04:42:08.317'),
(5257, 708, '1422', 'วิชาคณิตศาสตร์ ข้อ11-15', '11-15-3', 2, 2827, 'video', 'https://player.vimeo.com/video/1079699293?share=copy', 'unknown', NULL, 1, '2026-02-18 04:42:08.318', '2026-02-18 04:42:08.318'),
(5258, 708, '1423', 'วิชาคณิตศาสตร์ ข้อ16-20', '16-20-3', 3, 2481, 'video', 'https://player.vimeo.com/video/1079699023?share=copy', 'unknown', NULL, 1, '2026-02-18 04:42:08.318', '2026-02-18 04:42:08.318'),
(5259, 708, '1424', 'วิชาคณิตศาสตร์ ข้อ21-25', '21-25-3', 4, 1877, 'video', 'https://player.vimeo.com/video/1079698742?share=copy', 'unknown', NULL, 1, '2026-02-18 04:42:08.319', '2026-02-18 04:42:08.319'),
(5260, 708, '1425', 'วิชาคณิตศาสตร์ ข้อ26-30', '26-30-3', 5, 1974, 'video', 'https://player.vimeo.com/video/1079698471?share=copy', 'unknown', NULL, 1, '2026-02-18 04:42:08.319', '2026-02-18 04:42:08.319'),
(5261, 709, '1473', 'วิชาภาษาไทย ข้อ1-10', '1-10-3', 0, 4760, 'video', 'https://player.vimeo.com/video/1093032571?share=copy', 'unknown', NULL, 1, '2026-02-18 04:42:08.321', '2026-02-18 04:42:08.321'),
(5262, 709, '1474', 'วิชาภาษาไทย ข้อ11-20', '11-20-3', 1, 3729, 'video', 'https://player.vimeo.com/video/1093033731?share=copy', 'unknown', NULL, 1, '2026-02-18 04:42:08.321', '2026-02-18 04:42:08.321'),
(5263, 709, '1475', 'วิชาภาษาไทย ข้อ21-30', '21-30-5', 2, 2928, 'video', 'https://player.vimeo.com/video/1093034888?share=copy', 'unknown', NULL, 1, '2026-02-18 04:42:08.322', '2026-02-18 04:42:08.322'),
(5264, 709, '1476', 'วิชาภาษาไทย ข้อ31-40', '31-40-3', 3, 2795, 'video', 'https://player.vimeo.com/video/1093035540?share=copy', 'unknown', NULL, 1, '2026-02-18 04:42:08.322', '2026-02-18 04:42:08.322'),
(5265, 709, '1477', 'วิชาภาษาไทย ข้อ41-50', '41-50-2', 4, 1602, 'video', 'https://player.vimeo.com/video/1093035798?share=copy', 'unknown', NULL, 1, '2026-02-18 04:42:08.323', '2026-02-18 04:42:08.323'),
(5266, 710, '1429', 'วิชาภาษาอังกฤษ ข้อ1-12', '1-12-2', 0, 1816, 'video', 'https://player.vimeo.com/video/1079706929?share=copy', 'unknown', NULL, 1, '2026-02-18 04:42:08.324', '2026-02-18 04:42:08.324'),
(5267, 710, '1430', 'วิชาภาษาอังกฤษ ข้อ13-26', '13-26-2', 1, 2351, 'video', 'https://player.vimeo.com/video/1079707440?share=copy', 'unknown', NULL, 1, '2026-02-18 04:42:08.325', '2026-02-18 04:42:08.325'),
(5268, 710, '1431', 'วิชาภาษาอังกฤษ ข้อ27-32', '27-32-2', 2, 1394, 'video', 'https://player.vimeo.com/video/1079707612?share=copy', 'unknown', NULL, 1, '2026-02-18 04:42:08.325', '2026-02-18 04:42:08.325'),
(5269, 710, '1432', 'วิชาภาษาอังกฤษ ข้อ33-38', '33-38-2', 3, 1427, 'video', 'https://player.vimeo.com/video/1079707822?share=copy', 'unknown', NULL, 1, '2026-02-18 04:42:08.325', '2026-02-18 04:42:08.325'),
(5270, 710, '1433', 'วิชาภาษาอังกฤษ ข้อ39-52', '39-52-2', 4, 2873, 'video', 'https://player.vimeo.com/video/1079707953?share=copy', 'unknown', NULL, 1, '2026-02-18 04:42:08.326', '2026-02-18 04:42:08.326'),
(5271, 710, '1434', 'วิชาภาษาอังกฤษ ข้อ53-60', '53-60-2', 5, 4193, 'video', 'https://player.vimeo.com/video/1079708055?share=copy', 'unknown', NULL, 1, '2026-02-18 04:42:08.326', '2026-02-18 04:42:08.326'),
(5272, 710, '1435', 'วิชาภาษาอังกฤษ ข้อ61-70', '61-70', 6, 2321, 'video', 'https://player.vimeo.com/video/1079708373?share=copy', 'unknown', NULL, 1, '2026-02-18 04:42:08.327', '2026-02-18 04:42:08.327'),
(5273, 710, '1436', 'วิชาภาษาอังกฤษ ข้อ71-80', '71-80', 7, 2144, 'video', 'https://player.vimeo.com/video/1079708555?share=copy', 'unknown', NULL, 1, '2026-02-18 04:42:08.327', '2026-02-18 04:42:08.327'),
(5274, 711, '1438', 'วิชาสังคมศึกษา ข้อ1-10', '1-10-2', 0, 1721, 'video', 'https://player.vimeo.com/video/1079709675?share=copy', 'unknown', NULL, 1, '2026-02-18 04:42:08.328', '2026-02-18 04:42:08.328'),
(5275, 711, '1439', 'วิชาสังคมศึกษา ข้อ11-20', '11-20-2', 1, 2366, 'video', 'https://player.vimeo.com/video/1079709813?share=copy', 'unknown', NULL, 1, '2026-02-18 04:42:08.329', '2026-02-18 04:42:08.329'),
(5276, 711, '1440', 'วิชาสังคมศึกษา ข้อ21-30', '21-30-2', 2, 2736, 'video', 'https://player.vimeo.com/video/1079708870?share=copy', 'unknown', NULL, 1, '2026-02-18 04:42:08.329', '2026-02-18 04:42:08.329'),
(5277, 711, '1441', 'วิชาสังคมศึกษา ข้อ31-40', '31-40', 3, 3114, 'video', 'https://player.vimeo.com/video/1079709005?share=copy', 'unknown', NULL, 1, '2026-02-18 04:42:08.330', '2026-02-18 04:42:08.330'),
(5278, 712, '11194', 'ข้อที่ 1-10', '1-10-5', 0, 1394, 'video', 'https://player.vimeo.com/video/1142275653?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:42:08.330', '2026-02-18 04:42:08.330'),
(5279, 712, '11671', 'ข้อที่ 11-20', '11-20-4', 1, 963, 'video', 'https://player.vimeo.com/video/1143728799?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:42:08.331', '2026-02-18 04:42:08.331'),
(5280, 712, '11672', 'ข้อที่ 21-30', '21-30-3', 2, 1748, 'video', 'https://player.vimeo.com/video/1143728895?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:42:08.332', '2026-02-18 04:42:08.332'),
(5281, 712, '11675', 'ข้อที่ 31-35', '31-35', 3, 419, 'video', 'https://player.vimeo.com/video/1143729027?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:42:08.332', '2026-02-18 04:42:08.332'),
(5282, 712, '11678', 'ข้อที่ 36-40', '36-40', 4, 450, 'video', 'https://player.vimeo.com/video/1143729068?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:42:08.333', '2026-02-18 04:42:08.333'),
(5283, 712, '11679', 'ข้อที่ 41-50', '41-50-3', 5, 1299, 'video', 'https://player.vimeo.com/video/1143728677?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:42:08.333', '2026-02-18 04:42:08.333'),
(5284, 712, '11195', 'ข้อที่ 51-60', '51-60', 6, 1789, 'video', 'https://player.vimeo.com/video/1142275556?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:42:08.334', '2026-02-18 04:42:08.334'),
(5285, 712, '11680', 'ข้อที่ 61-70', '61-70-2', 7, 1547, 'video', 'https://player.vimeo.com/video/1143729199?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:42:08.334', '2026-02-18 04:42:08.334'),
(5286, 712, '12870', 'ข้อที่ 71-80', '71-80-2', 8, 950, 'video', 'https://player.vimeo.com/video/1145827692?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:42:08.334', '2026-02-18 04:42:08.334'),
(5287, 712, '12871', 'ข้อที่ 81-90', '81-90', 9, 767, 'video', 'https://player.vimeo.com/video/1145827733?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:42:08.335', '2026-02-18 04:42:08.335'),
(5288, 712, '11681', 'ข้อที่ 91-100', '91-100', 10, 1200, 'video', 'https://player.vimeo.com/video/1143729114?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:42:08.335', '2026-02-18 04:42:08.335'),
(5289, 713, '14043', 'ภาษาไทย EP.1 ข้อ 1-10', 'ep-1-1-10-2-7', 0, 2598, 'video', 'https://player.vimeo.com/video/1079682813?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:44:14.958', '2026-02-18 04:44:14.958'),
(5290, 713, '14044', 'ภาษาไทย EP.2 ข้อ 11-20', 'ep-2-11-20-2-7', 1, 1730, 'video', 'https://player.vimeo.com/video/1079682904?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:44:14.958', '2026-02-18 04:44:14.958');
INSERT INTO `lessons` (`id`, `module_id`, `public_id`, `title`, `slug`, `lesson_order`, `duration_seconds`, `type`, `video_url`, `video_provider`, `content_html`, `is_active`, `created_at`, `updated_at`) VALUES
(5291, 713, '14045', 'ภาษาไทย EP.3 ข้อ 21-40', 'ep-3-21-40-4', 2, 1877, 'video', 'https://player.vimeo.com/video/1079683008?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:44:14.958', '2026-02-18 04:44:14.958'),
(5292, 713, '14046', 'ภาษาไทย EP.4 ข้อ 41-50', 'ep-4-41-50-4', 3, 1766, 'video', 'https://player.vimeo.com/video/1079683166?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:44:14.959', '2026-02-18 04:44:14.959'),
(5293, 713, '18363', 'เฉลยแนวข้อสอบ-A-LEVEL-ภาษาไทย_TCAS69', 'a-level-tcas69-3', 4, NULL, 'video', NULL, NULL, NULL, 1, '2026-02-18 04:44:14.959', '2026-02-18 04:44:14.959'),
(5294, 714, '14048', 'ภาษาอังกฤษ EP.1 ข้อ 1-20', 'ep-1-1-20-2-7', 0, 1623, 'video', 'https://player.vimeo.com/video/1079685629?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:44:14.961', '2026-02-18 04:44:14.961'),
(5295, 714, '14049', 'ภาษาอังกฤษ EP.2 ข้อ 21-32', 'ep-2-21-32-2-7', 1, 2581, 'video', 'https://player.vimeo.com/video/1079685709?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:44:14.962', '2026-02-18 04:44:14.962'),
(5296, 714, '14050', 'ภาษาอังกฤษ EP.3 ข้อ 33-44', 'ep-3-33-44-2-7', 2, 1860, 'video', 'https://player.vimeo.com/video/1079685416?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:44:14.962', '2026-02-18 04:44:14.962'),
(5297, 714, '14051', 'ภาษาอังกฤษ EP.4 ข้อ 45-60', 'ep-4-45-60-2', 3, 1889, 'video', 'https://player.vimeo.com/video/1079685491?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:44:14.962', '2026-02-18 04:44:14.962'),
(5298, 714, '18430', 'ภาษาอังกฤษ EP.5 ข้อ 61-75', 'ep-5-61-75-2', 4, 2094, 'video', 'https://player.vimeo.com/video/1163525819?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:44:14.963', '2026-02-18 04:44:14.963'),
(5299, 714, '18431', 'ภาษาอังกฤษ EP.6 ข้อ 76-80', 'ep-6-76-80-2', 5, 1415, 'video', 'https://player.vimeo.com/video/1163525780?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:44:14.963', '2026-02-18 04:44:14.963'),
(5300, 714, '18364', 'เฉลยแนวข้อสอบ-A-LEVEL-ภาษาอังกฤษ_TCAS69', 'a-level-4', 6, NULL, 'video', NULL, NULL, NULL, 1, '2026-02-18 04:44:14.963', '2026-02-18 04:44:14.963'),
(5301, 715, '14053', 'สังคมศึกษา EP.1 ข้อ 1-10', 'ep-1-1-10-2-7-2', 0, 2104, 'video', 'https://player.vimeo.com/video/1079684152?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:44:14.964', '2026-02-18 04:44:14.964'),
(5302, 715, '14054', 'สังคมศึกษา EP.2 ข้อ 11-20', 'ep-2-11-20-2-7-2', 1, 1462, 'video', 'https://player.vimeo.com/video/1079683538?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:44:14.964', '2026-02-18 04:44:14.964'),
(5303, 715, '14055', 'สังคมศึกษา EP.3 ข้อ 21-30', 'ep-3-21-30-4', 2, 2508, 'video', 'https://player.vimeo.com/video/1079683691?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:44:14.964', '2026-02-18 04:44:14.964'),
(5304, 715, '14056', 'สังคมศึกษา EP.4 ข้อ 31-50', 'ep-4-31-50-4', 3, NULL, 'video', 'https://player.vimeo.com/video/1079683910?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:44:14.965', '2026-02-18 04:44:14.965'),
(5305, 715, '18365', 'เฉลยแนวข้อสอบ-A-LEVEL-สังคมศึกษา_TCAS69', 'a-level-3', 4, NULL, 'video', NULL, NULL, NULL, 1, '2026-02-18 04:44:14.965', '2026-02-18 04:44:14.965'),
(5306, 716, '1445', 'TPAT3 ข้อ1-10', 'tpat3-1-10-2', 0, 2275, 'video', 'https://player.vimeo.com/video/1078893555?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.226', '2026-02-18 04:44:17.226'),
(5307, 716, '1446', 'TPAT3 ข้อ11-20', 'tpat3-11-20-2', 1, 2278, 'video', 'https://player.vimeo.com/video/1078893579?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.226', '2026-02-18 04:44:17.226'),
(5308, 716, '1447', 'TPAT3 ข้อ21-30', 'tpat3-21-30-2', 2, 1428, 'video', 'https://player.vimeo.com/video/1078893627?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.227', '2026-02-18 04:44:17.227'),
(5309, 716, '1448', 'TPAT3 ข้อ31-40', 'tpat3-31-40', 3, 2000, 'video', 'https://player.vimeo.com/video/1078893664?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.227', '2026-02-18 04:44:17.227'),
(5310, 716, '1449', 'TPAT3 ข้อ41-50', 'tpat3-41-50-2', 4, 1967, 'video', 'https://player.vimeo.com/video/1078893701?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.227', '2026-02-18 04:44:17.227'),
(5311, 716, '8744', 'TPAT3 ข้อ51-60', 'tpat3-51-60-2', 5, 2087, 'video', 'https://player.vimeo.com/video/1137682055?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:44:17.227', '2026-02-18 04:44:17.227'),
(5312, 716, '1450', 'TPAT3 ข้อ61-70', 'tpat3-61-70-2', 6, 1725, 'video', 'https://player.vimeo.com/video/1078893740?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.228', '2026-02-18 04:44:17.228'),
(5313, 717, '1452', 'วิชาคณิตศาสตร์ ข้อ1-5', '1-5-4', 0, 2481, 'video', 'https://player.vimeo.com/video/1078890796?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.228', '2026-02-18 04:44:17.228'),
(5314, 717, '1453', 'วิชาคณิตศาสตร์ ข้อ6-10', '6-10-4', 1, 2717, 'video', 'https://player.vimeo.com/video/1078890910?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.229', '2026-02-18 04:44:17.229'),
(5315, 717, '1454', 'วิชาคณิตศาสตร์ ข้อ11-15', '11-15-4', 2, 2827, 'video', 'https://player.vimeo.com/video/1078890764?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.230', '2026-02-18 04:44:17.230'),
(5316, 717, '1455', 'วิชาคณิตศาสตร์ ข้อ16-20', '16-20-4', 3, 2480, 'video', 'https://player.vimeo.com/video/1078890517?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.230', '2026-02-18 04:44:17.230'),
(5317, 717, '1456', 'วิชาคณิตศาสตร์ ข้อ21-25', '21-25-4', 4, 1877, 'video', 'https://player.vimeo.com/video/1078890945?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.230', '2026-02-18 04:44:17.230'),
(5318, 717, '1457', 'วิชาคณิตศาสตร์ ข้อ25-30', '25-30', 5, 1974, 'video', 'https://player.vimeo.com/video/1078890455?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.231', '2026-02-18 04:44:17.231'),
(5319, 718, '1459', 'วิชาเคมี ข้อ1-5', '1-5-2', 0, 2217, 'video', 'https://player.vimeo.com/video/1115705202?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.231', '2026-02-18 04:44:17.231'),
(5320, 718, '2523', 'วิชาเคมี ข้อ6-10', '6-10-2', 1, 2052, 'video', 'https://player.vimeo.com/video/1115705234?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.231', '2026-02-18 04:44:17.231'),
(5321, 718, '2524', 'วิชาเคมี ข้อ11-15', '11-15-3', 2, 2313, 'video', 'https://player.vimeo.com/video/1115705294?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.232', '2026-02-18 04:44:17.232'),
(5322, 718, '2525', 'วิชาเคมี ข้อ16-20', '16-20-3', 3, 2137, 'video', 'https://player.vimeo.com/video/1115705384?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.232', '2026-02-18 04:44:17.232'),
(5323, 718, '2526', 'วิชาเคมี ข้อ21-25', '21-25-3', 4, 2108, 'video', 'https://player.vimeo.com/video/1115705420?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.232', '2026-02-18 04:44:17.232'),
(5324, 718, '2527', 'วิชาเคมี ข้อ26-30', '26-30-2', 5, 1886, 'video', 'https://player.vimeo.com/video/1115705446?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.233', '2026-02-18 04:44:17.233'),
(5325, 718, '2528', 'วิชาเคมี ข้อ31-35', '31-35-3', 6, 2263, 'video', 'https://player.vimeo.com/video/1115705342?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.233', '2026-02-18 04:44:17.233'),
(5326, 719, '1461', 'วิชาภาษาอังกฤษ ข้อ1-12', '1-12-3', 0, 1816, 'video', 'https://player.vimeo.com/video/1078892192?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.234', '2026-02-18 04:44:17.234'),
(5327, 719, '1462', 'วิชาภาษาอังกฤษ ข้อ13-26', '13-26-3', 1, 2351, 'video', 'https://player.vimeo.com/video/1078893081?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.234', '2026-02-18 04:44:17.234'),
(5328, 719, '1463', 'วิชาภาษาอังกฤษ ข้อ27-32', '27-32-3', 2, 1394, 'video', 'https://player.vimeo.com/video/1078892641?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.235', '2026-02-18 04:44:17.235'),
(5329, 719, '1464', 'วิชาภาษาอังกฤษ ข้อ33-38', '33-38-3', 3, 1427, 'video', 'https://player.vimeo.com/video/1078892602?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.235', '2026-02-18 04:44:17.235'),
(5330, 719, '1465', 'วิชาภาษาอังกฤษ ข้อ39-44', '39-44', 4, 895, 'video', 'https://player.vimeo.com/video/1078893044?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.235', '2026-02-18 04:44:17.235'),
(5331, 719, '1467', 'วิชาภาษาอังกฤษ ข้อ45-52', '45-52', 5, 1987, 'video', 'https://player.vimeo.com/video/1093040122?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.236', '2026-02-18 04:44:17.236'),
(5332, 719, '1466', 'วิชาภาษาอังกฤษ ข้อ53-60', '53-60-3', 6, 2215, 'video', 'https://player.vimeo.com/video/1078893132?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.236', '2026-02-18 04:44:17.236'),
(5333, 719, '1468', 'วิชาภาษาอังกฤษ ข้อ61-65', '61-65-2', 7, 1107, 'video', 'https://player.vimeo.com/video/1093041088?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.236', '2026-02-18 04:44:17.236'),
(5334, 719, '1470', 'วิชาภาษาอังกฤษ ข้อ71-75', '71-75', 8, 842, 'video', 'https://player.vimeo.com/video/1078892686?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.237', '2026-02-18 04:44:17.237'),
(5335, 719, '1471', 'วิชาภาษาอังกฤษ ข้อ76-77', '76-77', 9, 1319, 'video', 'https://player.vimeo.com/video/1078892725?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.237', '2026-02-18 04:44:17.237'),
(5336, 719, '1472', 'วิชาภาษาอังกฤษ ข้อ78-80', '78-80-2', 10, 1311, 'video', 'https://player.vimeo.com/video/1078892828?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.237', '2026-02-18 04:44:17.237'),
(5337, 720, '2243', 'ข้อ1-3', '1-3', 0, 1350, 'video', 'https://player.vimeo.com/video/1078891376?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.238', '2026-02-18 04:44:17.238'),
(5338, 720, '2244', 'ข้อ4-6', '4-6', 1, 1902, 'video', 'https://player.vimeo.com/video/1078890989?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.238', '2026-02-18 04:44:17.238'),
(5339, 720, '2245', 'ข้อ7-10', '7-10', 2, 1658, 'video', 'https://player.vimeo.com/video/1078891086?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.239', '2026-02-18 04:44:17.239'),
(5340, 720, '2246', 'ข้อ11-15', '11-15', 3, 1998, 'video', 'https://player.vimeo.com/video/1145821026?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:44:17.239', '2026-02-18 04:44:17.239'),
(5341, 720, '2247', 'ข้อ16-20', '16-20', 4, 2318, 'video', 'https://player.vimeo.com/video/1104694246?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.239', '2026-02-18 04:44:17.239'),
(5342, 720, '2248', 'ข้อ21-25', '21-25', 5, 1661, 'video', 'https://player.vimeo.com/video/1104694295?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.240', '2026-02-18 04:44:17.240'),
(5343, 720, '2249', 'ข้อ26-30', '26-30', 6, 2420, 'video', 'https://player.vimeo.com/video/1104694445?share=copy', 'unknown', NULL, 1, '2026-02-18 04:44:17.240', '2026-02-18 04:44:17.240'),
(5344, 721, '13982', 'วิชาคณิคศาสตร์ EP.1 ข้อ 1-5', 'ep-1-1-5-2-6', 0, 2118, 'video', 'https://player.vimeo.com/video/1093048744?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:46:29.071', '2026-02-18 04:46:29.071'),
(5345, 721, '13983', 'วิชาคณิคศาสตร์ EP.2 ข้อ 6-10', 'ep-2-6-10-2-6', 1, 2392, 'video', 'https://player.vimeo.com/video/1093047885?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:46:29.071', '2026-02-18 04:46:29.071'),
(5346, 721, '13984', 'วิชาคณิคศาสตร์ EP.3 ข้อ 11-15', 'ep-3-11-15-2-6', 2, 1923, 'video', 'https://player.vimeo.com/video/1093048074?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:46:29.072', '2026-02-18 04:46:29.072'),
(5347, 721, '13985', 'วิชาคณิคศาสตร์ EP.4 ข้อ 16-20', 'ep-4-16-20-4', 3, 1364, 'video', 'https://player.vimeo.com/video/1162455821?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:46:29.072', '2026-02-18 04:46:29.072'),
(5348, 721, '13986', 'วิชาคณิคศาสตร์ EP.5 ข้อ 21-25', 'ep-5-21-25-2-6', 4, 1847, 'video', 'https://player.vimeo.com/video/1093047759?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:46:29.073', '2026-02-18 04:46:29.073'),
(5349, 721, '13987', 'วิชาคณิคศาสตร์ EP.6 ข้อ 26-30', 'ep-6-26-30-2-6', 5, 2502, 'video', 'https://player.vimeo.com/video/1093048663?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:46:29.073', '2026-02-18 04:46:29.073'),
(5350, 721, '18359', 'เฉลยแนวข้อสอบ-A-LEVEL-คณิตศาสตร์ประยุกต์_TCAS69', 'a-level-3', 6, NULL, 'video', NULL, NULL, NULL, 1, '2026-02-18 04:46:29.074', '2026-02-18 04:46:29.074'),
(5351, 722, '14003', 'ภาษาไทย EP.1 ข้อ 1-10', 'ep-1-1-10-2-6', 0, 2356, 'video', 'https://player.vimeo.com/video/1079682813?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:46:29.075', '2026-02-18 04:46:29.075'),
(5352, 722, '14004', 'ภาษาไทย EP.2 ข้อ 11-20', 'ep-2-11-20-2-6', 1, 1730, 'video', 'https://player.vimeo.com/video/1079682904?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:46:29.075', '2026-02-18 04:46:29.075'),
(5353, 722, '14005', 'ภาษาไทย EP.3 ข้อ 21-40', 'ep-3-21-40-3', 2, 1877, 'video', 'https://player.vimeo.com/video/1079683008?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:46:29.075', '2026-02-18 04:46:29.075'),
(5354, 722, '14006', 'ภาษาไทย EP.4 ข้อ 41-50', 'ep-4-41-50-3', 3, 1766, 'video', 'https://player.vimeo.com/video/1079683166?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:46:29.076', '2026-02-18 04:46:29.076'),
(5355, 722, '18360', 'เฉลยแนวข้อสอบ-A-LEVEL-ภาษาไทย_TCAS69', 'a-level-tcas69-2', 4, NULL, 'video', NULL, NULL, NULL, 1, '2026-02-18 04:46:29.076', '2026-02-18 04:46:29.076'),
(5356, 723, '14008', 'ภาษาอังกฤษ EP.1 ข้อ 1-20', 'ep-1-1-20-2-6', 0, 1623, 'video', 'https://player.vimeo.com/video/1079685629?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:46:29.077', '2026-02-18 04:46:29.077'),
(5357, 723, '14009', 'ภาษาอังกฤษ EP.2 ข้อ 21-32', 'ep-2-21-32-2-6', 1, 2581, 'video', 'https://player.vimeo.com/video/1079685709?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:46:29.078', '2026-02-18 04:46:29.078'),
(5358, 723, '14010', 'ภาษาอังกฤษ EP.3 ข้อ 33-44', 'ep-3-33-44-2-6', 2, 1860, 'video', 'https://player.vimeo.com/video/1079685416?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:46:29.078', '2026-02-18 04:46:29.078'),
(5359, 723, '14011', 'ภาษาอังกฤษ EP.4 ข้อ 45-60', 'ep-4-45-60-3', 3, 1889, 'video', 'https://player.vimeo.com/video/1079685491?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:46:29.078', '2026-02-18 04:46:29.078'),
(5360, 723, '18433', 'ภาษาอังกฤษ EP.5 ข้อ 61-75', 'ep-5-61-75-3', 4, 2094, 'video', 'https://player.vimeo.com/video/1163525819?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:46:29.079', '2026-02-18 04:46:29.079'),
(5361, 723, '18432', 'ภาษาอังกฤษ EP.6 ข้อ 76-80', 'ep-6-76-80-3', 5, 1415, 'video', 'https://player.vimeo.com/video/1163525780?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:46:29.081', '2026-02-18 04:46:29.081'),
(5362, 723, '18361', 'เฉลยแนวข้อสอบ-A-LEVEL-ภาษาอังกฤษ_TCAS69', 'a-level-3-2', 6, NULL, 'video', NULL, NULL, NULL, 1, '2026-02-18 04:46:29.081', '2026-02-18 04:46:29.081'),
(5363, 724, '14013', 'สังคมศึกษา EP.1 ข้อ 1-10', 'ep-1-1-10-2-6-2', 0, 1693, 'video', 'https://player.vimeo.com/video/1079684152?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:46:29.082', '2026-02-18 04:46:29.082'),
(5364, 724, '14014', 'สังคมศึกษา EP.2 ข้อ 11-20', 'ep-2-11-20-2-6-2', 1, 1505, 'video', 'https://player.vimeo.com/video/1079683538?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:46:29.082', '2026-02-18 04:46:29.082'),
(5365, 724, '14015', 'สังคมศึกษา EP.3 ข้อ 21-30', 'ep-3-21-30-3', 2, 2508, 'video', 'https://player.vimeo.com/video/1079683691?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:46:29.083', '2026-02-18 04:46:29.083'),
(5366, 724, '14016', 'สังคมศึกษา EP.4 ข้อ 31-50', 'ep-4-31-50-3', 3, NULL, 'video', 'https://player.vimeo.com/video/1079683910?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:46:29.083', '2026-02-18 04:46:29.083'),
(5367, 724, '18362', 'เฉลยแนวข้อสอบ-A-LEVEL-สังคมศึกษา_TCAS69', 'a-level-2', 4, NULL, 'video', NULL, NULL, NULL, 1, '2026-02-18 04:46:29.083', '2026-02-18 04:46:29.083'),
(5368, 725, '13945', 'วิชาคณิคศาสตร์ EP.1 ข้อ 1-5', 'ep-1-1-5-2-5', 0, 2118, 'video', 'https://player.vimeo.com/video/1093048744?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:47:59.668', '2026-02-18 04:47:59.668'),
(5369, 725, '13946', 'วิชาคณิคศาสตร์ EP.2 ข้อ 6-10', 'ep-2-6-10-2-5', 1, 2392, 'video', 'https://player.vimeo.com/video/1093047885?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:47:59.669', '2026-02-18 04:47:59.669'),
(5370, 725, '13947', 'วิชาคณิคศาสตร์ EP.3 ข้อ 11-15', 'ep-3-11-15-2-5', 2, 2356, 'video', 'https://player.vimeo.com/video/1093048074?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:47:59.669', '2026-02-18 04:47:59.669'),
(5371, 725, '13948', 'วิชาคณิคศาสตร์ EP.4 ข้อ 16-20', 'ep-4-16-20-5', 3, 1816, 'video', 'https://player.vimeo.com/video/1162455821?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:47:59.669', '2026-02-18 04:47:59.669'),
(5372, 725, '13949', 'วิชาคณิคศาสตร์ EP.5 ข้อ 21-25', 'ep-5-21-25-2-5', 4, 1847, 'video', 'https://player.vimeo.com/video/1093047759?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:47:59.669', '2026-02-18 04:47:59.669'),
(5373, 725, '13950', 'วิชาคณิคศาสตร์ EP.6 ข้อ 26-30', 'ep-6-26-30-2-5', 5, 2502, 'video', 'https://player.vimeo.com/video/1093048663?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:47:59.670', '2026-02-18 04:47:59.670'),
(5374, 725, '18355', 'เฉลยแนวข้อสอบ-A-LEVEL-คณิตศาสตร์ประยุกต์_TCAS69', 'a-level-2', 6, NULL, 'video', NULL, NULL, NULL, 1, '2026-02-18 04:47:59.670', '2026-02-18 04:47:59.670'),
(5375, 726, '13952', 'ฟิสิกส์ EP.1 ข้อที่ 1-10', 'ep-1-1-10-2-5', 0, 3620, 'video', 'https://player.vimeo.com/video/1079693107?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:47:59.671', '2026-02-18 04:47:59.671'),
(5376, 726, '13953', 'ฟิสิกส์ EP.2 ข้อที่ 11-20', 'ep-2-11-20-2-5', 1, 3690, 'video', 'https://player.vimeo.com/video/1079693367?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:47:59.671', '2026-02-18 04:47:59.671'),
(5377, 726, '13954', 'ฟิสิกส์ EP.3 ข้อที่ 21-30', 'ep-3-21-30-2-5', 2, 2257, 'video', 'https://player.vimeo.com/video/1079693635?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:47:59.671', '2026-02-18 04:47:59.671'),
(5378, 726, '18356', 'เฉลยแนวข้อสอบ-A-LEVEL-ฟิสิกส์_TCAS69', 'a-level-tcas69-2', 3, NULL, 'video', NULL, NULL, NULL, 1, '2026-02-18 04:47:59.672', '2026-02-18 04:47:59.672'),
(5379, 727, '13956', 'เคมี EP.1 ข้อที่ 1-10', 'ep-1-1-10-2-5-2', 0, 3194, 'video', 'https://player.vimeo.com/video/1079692846?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:47:59.673', '2026-02-18 04:47:59.673'),
(5380, 727, '13957', 'เคมี EP.2 ข้อ 11 - 20', 'ep-2-11-20-2-5-2', 1, 2472, 'video', 'https://player.vimeo.com/video/1079692959?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:47:59.674', '2026-02-18 04:47:59.674'),
(5381, 727, '13958', 'เคมี EP.3 ข้อ 21-30', 'ep-3-21-30-2-5-2', 2, 2260, 'video', 'https://player.vimeo.com/video/1079692646?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:47:59.674', '2026-02-18 04:47:59.674'),
(5382, 727, '13959', 'เคมี EP.4 ข้อ 31-35', 'ep-4-31-35-2-5', 3, NULL, 'video', 'https://player.vimeo.com/video/1079692724?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:47:59.674', '2026-02-18 04:47:59.674'),
(5383, 727, '18357', 'เฉลยแนวข้อสอบ-A-LEVEL-เคมี_TCAS69', 'a-level-tcas69-2-2', 4, NULL, 'video', NULL, NULL, NULL, 1, '2026-02-18 04:47:59.675', '2026-02-18 04:47:59.675'),
(5384, 728, '13971', 'ภาษาอังกฤษ EP.1 ข้อ 1-20', 'ep-1-1-20-2-5', 0, 2107, 'video', 'https://player.vimeo.com/video/1079685629?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:47:59.675', '2026-02-18 04:47:59.675'),
(5385, 728, '13972', 'ภาษาอังกฤษ EP.2 ข้อ 21-32', 'ep-2-21-32-2-5', 1, 1682, 'video', 'https://player.vimeo.com/video/1079685709?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:47:59.676', '2026-02-18 04:47:59.676'),
(5386, 728, '13973', 'ภาษาอังกฤษ EP.3 ข้อ 33-44', 'ep-3-33-44-2-5', 2, 1860, 'video', 'https://player.vimeo.com/video/1079685416?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:47:59.676', '2026-02-18 04:47:59.676'),
(5387, 728, '13974', 'ภาษาอังกฤษ EP.4 ข้อ 45-60', 'ep-4-45-60-4', 3, 1889, 'video', 'https://player.vimeo.com/video/1079685491?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:47:59.676', '2026-02-18 04:47:59.676'),
(5388, 728, '18434', 'ภาษาอังกฤษ EP.5 ข้อ 61-75', 'ep-5-61-75-4', 4, NULL, 'video', 'https://player.vimeo.com/video/1163525819?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:47:59.677', '2026-02-18 04:47:59.677'),
(5389, 728, '18435', 'ภาษาอังกฤษ EP.6 ข้อ 76-80', 'ep-6-76-80-4', 5, NULL, 'video', 'https://player.vimeo.com/video/1163525780?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:47:59.677', '2026-02-18 04:47:59.677'),
(5390, 728, '18358', 'เฉลยแนวข้อสอบ-A-LEVEL-ภาษาอังกฤษ_TCAS69', 'a-level-2-2', 6, NULL, 'video', NULL, NULL, NULL, 1, '2026-02-18 04:47:59.677', '2026-02-18 04:47:59.677'),
(5391, 729, '13746', 'วิชาคณิคศาสตร์ EP.1 ข้อ 1-5', 'ep-1-1-5-2', 0, 2118, 'video', 'https://player.vimeo.com/video/1093048744?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.677', '2026-02-18 04:50:08.677'),
(5392, 729, '13747', 'วิชาคณิคศาสตร์ EP.2 ข้อ 6-10', 'ep-2-6-10-2', 1, 1577, 'video', 'https://player.vimeo.com/video/1093047885?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.678', '2026-02-18 04:50:08.678'),
(5393, 729, '13748', 'วิชาคณิคศาสตร์ EP.3 ข้อ 11-15', 'ep-3-11-15-2', 2, 1923, 'video', 'https://player.vimeo.com/video/1093048074?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.681', '2026-02-18 04:50:08.681'),
(5394, 729, '13749', 'วิชาคณิคศาสตร์ EP.4 ข้อ 16-20', 'ep-4-16-20-2', 3, 1364, 'video', 'https://player.vimeo.com/video/1162455821?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.681', '2026-02-18 04:50:08.681'),
(5395, 729, '13750', 'วิชาคณิคศาสตร์ EP.5 ข้อ 21-25', 'ep-5-21-25-2', 4, 2673, 'video', 'https://player.vimeo.com/video/1093047759?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.682', '2026-02-18 04:50:08.682'),
(5396, 729, '13751', 'วิชาคณิคศาสตร์ EP.6 ข้อ 26-30', 'ep-6-26-30-2', 5, 1528, 'video', 'https://player.vimeo.com/video/1093048663?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.682', '2026-02-18 04:50:08.682'),
(5397, 729, '18348', 'เฉลยแนวข้อสอบ-A-LEVEL-คณิตศาสตร์ประยุกต์_TCAS69', 'a-level', 6, NULL, 'video', NULL, NULL, NULL, 1, '2026-02-18 04:50:08.683', '2026-02-18 04:50:08.683'),
(5398, 730, '13753', 'ฟิสิกส์ EP.1 ข้อที่ 1-10', 'ep-1-1-10-2', 0, 3677, 'video', 'https://player.vimeo.com/video/1079693107?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.684', '2026-02-18 04:50:08.684'),
(5399, 730, '13754', 'ฟิสิกส์ EP.2 ข้อที่ 11-20', 'ep-2-11-20-2', 1, 3554, 'video', 'https://player.vimeo.com/video/1079693367?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.684', '2026-02-18 04:50:08.684'),
(5400, 730, '13755', 'ฟิสิกส์ EP.3 ข้อที่ 21-30', 'ep-3-21-30-2', 2, 3818, 'video', 'https://player.vimeo.com/video/1079693635?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.685', '2026-02-18 04:50:08.685'),
(5401, 730, '18349', 'เฉลยแนวข้อสอบ-A-LEVEL-ฟิสิกส์_TCAS69', 'a-level-tcas69', 3, NULL, 'video', NULL, NULL, NULL, 1, '2026-02-18 04:50:08.686', '2026-02-18 04:50:08.686'),
(5402, 731, '13757', 'เคมี EP.1 ข้อที่ 1-10', 'ep-1-1-10-2-2', 0, 2573, 'video', 'https://player.vimeo.com/video/1079692846?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.687', '2026-02-18 04:50:08.687'),
(5403, 731, '13758', 'เคมี EP.2 ข้อ 11 - 20', 'ep-2-11-20-2-2', 1, 3155, 'video', 'https://player.vimeo.com/video/1079692959?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.687', '2026-02-18 04:50:08.687'),
(5404, 731, '13759', 'เคมี EP.3 ข้อ 21-30', 'ep-3-21-30-2-2', 2, 2024, 'video', 'https://player.vimeo.com/video/1079692646?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.687', '2026-02-18 04:50:08.687'),
(5405, 731, '13760', 'เคมี EP.4 ข้อ 31-35', 'ep-4-31-35-2', 3, 3408, 'video', 'https://player.vimeo.com/video/1079692724?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.688', '2026-02-18 04:50:08.688'),
(5406, 731, '18350', 'เฉลยแนวข้อสอบ-A-LEVEL-เคมี_TCAS69', 'a-level-tcas69-2', 4, NULL, 'video', NULL, NULL, NULL, 1, '2026-02-18 04:50:08.688', '2026-02-18 04:50:08.688'),
(5407, 732, '13762', 'ชีววิทยา EP.1 ข้อที่ 1-10', 'ep-1-1-10-2-2-3', 0, 2836, 'video', 'https://player.vimeo.com/video/1079692513?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.689', '2026-02-18 04:50:08.689'),
(5408, 732, '13763', 'ชีววิทยา EP.2 ข้อที่ 11-20', 'ep-2-11-20-2-2-3', 1, 2597, 'video', 'https://player.vimeo.com/video/1079692169?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.690', '2026-02-18 04:50:08.690'),
(5409, 732, '13764', 'ชีววิทยา EP.3 ข้อที่ 21-30', 'ep-3-21-30-2-2-3', 2, 2140, 'video', 'https://player.vimeo.com/video/1079692272?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.690', '2026-02-18 04:50:08.690'),
(5410, 732, '13765', 'ชีววิทยา EP.4 ข้อที่ 31-40', 'ep-4-31-40-2', 3, 2241, 'video', 'https://player.vimeo.com/video/1079692366?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.690', '2026-02-18 04:50:08.690'),
(5411, 732, '18351', 'เฉลยแนวข้อสอบ-A-LEVEL-ชีววิทยา_TCAS69', 'a-level-t', 4, NULL, 'video', NULL, NULL, NULL, 1, '2026-02-18 04:50:08.691', '2026-02-18 04:50:08.691'),
(5412, 733, '13767', 'ภาษาไทย EP.1 ข้อ 1-10', 'ep-1-1-10-2-2-3-4', 0, 2598, 'video', 'https://player.vimeo.com/video/1079682813?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.695', '2026-02-18 04:50:08.695'),
(5413, 733, '13768', 'ภาษาไทย EP.2 ข้อ 11-20', 'ep-2-11-20-2-2-3-4', 1, 2038, 'video', 'https://player.vimeo.com/video/1079682904?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.696', '2026-02-18 04:50:08.696'),
(5414, 733, '13769', 'ภาษาไทย EP.3 ข้อ 21-40', 'ep-3-21-40', 2, 3448, 'video', 'https://player.vimeo.com/video/1079683008?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.696', '2026-02-18 04:50:08.696'),
(5415, 733, '13771', 'ภาษาไทย EP.4 ข้อ 41-50', 'ep-4-41-50', 3, 1389, 'video', 'https://player.vimeo.com/video/1079683166?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.696', '2026-02-18 04:50:08.696'),
(5416, 733, '18352', 'เฉลยแนวข้อสอบ-A-LEVEL-ภาษาไทย_TCAS69', 'a-level-tcas69-2-3', 4, NULL, 'video', NULL, NULL, NULL, 1, '2026-02-18 04:50:08.697', '2026-02-18 04:50:08.697'),
(5417, 734, '13773', 'ภาษาอังกฤษ EP.1 ข้อ 1-20', 'ep-1-1-20-2', 0, 2107, 'video', 'https://player.vimeo.com/video/1079685629?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.700', '2026-02-18 04:50:08.700'),
(5418, 734, '13774', 'ภาษาอังกฤษ EP.2 ข้อ 21-32', 'ep-2-21-32-2', 1, 1682, 'video', 'https://player.vimeo.com/video/1079685709?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.700', '2026-02-18 04:50:08.700'),
(5419, 734, '13775', 'ภาษาอังกฤษ EP.3 ข้อ 33-44', 'ep-3-33-44-2', 2, 1559, 'video', 'https://player.vimeo.com/video/1079685416?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.700', '2026-02-18 04:50:08.700'),
(5420, 734, '13778', 'ภาษาอังกฤษ EP.4 ข้อ 45-60', 'ep-4-45-60', 3, 2607, 'video', 'https://player.vimeo.com/video/1079685491?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.701', '2026-02-18 04:50:08.701'),
(5421, 734, '18428', 'ภาษาอังกฤษ EP.5 ข้อ 61-75', 'ep-5-61-75', 4, 2094, 'video', 'https://player.vimeo.com/video/1163525819?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.701', '2026-02-18 04:50:08.701'),
(5422, 734, '18429', 'ภาษาอังกฤษ EP.6 ข้อ 76-80', 'ep-6-76-80', 5, 1415, 'video', 'https://player.vimeo.com/video/1163525780?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.702', '2026-02-18 04:50:08.702'),
(5423, 734, '18353', 'เฉลยแนวข้อสอบ-A-LEVEL-ภาษาอังกฤษ_TCAS69', 'a-level-2', 6, NULL, 'video', NULL, NULL, NULL, 1, '2026-02-18 04:50:08.703', '2026-02-18 04:50:08.703'),
(5424, 735, '13781', 'สังคมศึกษา EP.1 ข้อ 1-10', 'ep-1-1-10-2-2-3-4-5', 0, 2104, 'video', 'https://player.vimeo.com/video/1079684152?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.705', '2026-02-18 04:50:08.705'),
(5425, 735, '13782', 'สังคมศึกษา EP.2 ข้อ 11-20', 'ep-2-11-20-2-2-3-4-5', 1, 1463, 'video', 'https://player.vimeo.com/video/1079683538?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.706', '2026-02-18 04:50:08.706'),
(5426, 735, '13783', 'สังคมศึกษา EP.3 ข้อ 21-30', 'ep-3-21-30', 2, 1784, 'video', 'https://player.vimeo.com/video/1079683691?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.706', '2026-02-18 04:50:08.706'),
(5427, 735, '13784', 'สังคมศึกษา EP.4 ข้อ 31-50', 'ep-4-31-50', 3, 3314, 'video', 'https://player.vimeo.com/video/1079683910?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:50:08.706', '2026-02-18 04:50:08.706'),
(5428, 735, '18354', 'เฉลยแนวข้อสอบ-A-LEVEL-สังคมศึกษา_TCAS69', 'a-level-2-3', 4, NULL, 'video', NULL, NULL, NULL, 1, '2026-02-18 04:50:08.707', '2026-02-18 04:50:08.707'),
(5463, 741, '1797', 'ข้อสอบคณิตศาสตร์ ชุดที่1', '1', 0, 6382, 'video', 'https://player.vimeo.com/video/1095801631?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:03.749', '2026-02-18 04:56:03.749'),
(5464, 741, '1798', 'ข้อสอบคณิตศาสตร์ ชุดที่2', '2', 1, 5710, 'video', 'https://player.vimeo.com/video/1146162483?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:56:03.750', '2026-02-18 04:56:03.750'),
(5465, 741, '1799', 'ข้อสอบคณิตศาสตร์ ชุดที่3', '3', 2, 6015, 'video', 'https://player.vimeo.com/video/1146162082?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:56:03.750', '2026-02-18 04:56:03.750'),
(5466, 742, '1800', 'ข้อสอบภาษาอังกฤษ ชุดที่1', '1-2', 0, 7248, 'video', 'https://player.vimeo.com/video/1095798444?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:03.751', '2026-02-18 04:56:03.751'),
(5467, 742, '1801', 'ข้อสอบภาษาอังกฤษ ชุดที่2', '2-2', 1, 7720, 'video', 'https://player.vimeo.com/video/1095798644?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:03.751', '2026-02-18 04:56:03.751'),
(5468, 742, '1802', 'ข้อสอบภาษาอังกฤษ ชุดที่3', '3-2', 2, 8032, 'video', 'https://player.vimeo.com/video/1095799956?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:03.754', '2026-02-18 04:56:03.754'),
(5469, 743, '1803', 'ข้อสอบภาษาไทย ชุดที่1', '1-2-3', 0, 1936, 'video', 'https://player.vimeo.com/video/1095797590?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:03.762', '2026-02-18 04:56:03.762'),
(5470, 743, '1804', 'ข้อสอบภาษาไทย ชุดที่2', '2-2-3', 1, 1658, 'video', 'https://player.vimeo.com/video/1095797695?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:03.763', '2026-02-18 04:56:03.763'),
(5471, 743, '1805', 'ข้อสอบภาษาไทย ชุดที่3', '3-2-3', 2, 2082, 'video', 'https://player.vimeo.com/video/1095797842?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:03.764', '2026-02-18 04:56:03.764'),
(5472, 744, '2058', 'คลิปเฉลยวิชากฎหมาย(Update เร็วๆนี้)', 'update', 0, NULL, 'video', NULL, NULL, NULL, 1, '2026-02-18 04:56:03.765', '2026-02-18 04:56:03.765'),
(5473, 745, '2671', 'ข้อที่ 1-12', '1-12', 0, 1816, 'video', 'https://player.vimeo.com/video/1121048833?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:29.065', '2026-02-18 04:56:29.065'),
(5474, 745, '2672', 'ข้อที่ 13-26', '13-26', 1, 2351, 'video', 'https://player.vimeo.com/video/1121048648?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:29.065', '2026-02-18 04:56:29.065'),
(5475, 745, '2673', 'ข้อที่ 27-32', '27-32', 2, 1394, 'video', 'https://player.vimeo.com/video/1121048662?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:29.065', '2026-02-18 04:56:29.065'),
(5476, 745, '2674', 'ข้อที่ 33-38', '33-38', 3, 1427, 'video', 'https://player.vimeo.com/video/1121048677?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:29.065', '2026-02-18 04:56:29.065'),
(5477, 745, '2675', 'ข้อที่ 39-52', '39-52', 4, 2873, 'video', 'https://player.vimeo.com/video/1121048692?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:29.066', '2026-02-18 04:56:29.066'),
(5478, 745, '2676', 'ข้อที่ 53-60', '53-60', 5, NULL, 'video', 'https://player.vimeo.com/video/1121048712?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:29.066', '2026-02-18 04:56:29.066'),
(5479, 745, '2677', 'ข้อที่ 61-70', '61-70', 6, 1107, 'video', 'https://player.vimeo.com/video/1121048735?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:29.066', '2026-02-18 04:56:29.066'),
(5480, 746, '2679', 'ข้อที่ 1-5', '1-5', 0, 3038, 'video', 'https://player.vimeo.com/video/1121039944?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:29.067', '2026-02-18 04:56:29.067'),
(5481, 746, '2680', 'ข้อที่ 6-10', '6-10', 1, 2657, 'video', 'https://player.vimeo.com/video/1121039973?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:29.068', '2026-02-18 04:56:29.068'),
(5482, 746, '2681', 'ข้อที่ 11-15', '11-15', 2, NULL, 'video', 'https://player.vimeo.com/video/1121039988?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:29.069', '2026-02-18 04:56:29.069'),
(5483, 746, '2682', 'ข้อที่ 16-20', '16-20', 3, NULL, 'video', 'https://player.vimeo.com/video/1121040013?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:29.069', '2026-02-18 04:56:29.069'),
(5484, 746, '2683', 'ข้อที่ 21-25', '21-25', 4, NULL, 'video', 'https://player.vimeo.com/video/1121040044?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:29.069', '2026-02-18 04:56:29.069'),
(5485, 746, '2684', 'ข้อที่ 26-30', '26-30-2', 5, NULL, 'video', 'https://player.vimeo.com/video/1121040059?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:29.069', '2026-02-18 04:56:29.069'),
(5486, 747, '2686', 'ข้อที่ 1-10', '1-10-2', 0, 1721, 'video', 'https://player.vimeo.com/video/1121038769?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:29.070', '2026-02-18 04:56:29.070'),
(5487, 747, '2687', 'ข้อที่ 11-20', '11-20', 1, 2366, 'video', 'https://player.vimeo.com/video/1121038791?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:29.070', '2026-02-18 04:56:29.070'),
(5488, 747, '2688', 'ข้อที่ 21-30', '21-30', 2, 2736, 'video', 'https://player.vimeo.com/video/1121038818?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:29.071', '2026-02-18 04:56:29.071'),
(5489, 747, '2689', 'ข้อที่ 31-40', '31-40', 3, NULL, 'video', 'https://player.vimeo.com/video/1121038851?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:29.071', '2026-02-18 04:56:29.071'),
(5490, 747, '2690', 'ข้อที่ 41-50', '41-50', 4, NULL, 'video', 'https://player.vimeo.com/video/1121038881?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:29.071', '2026-02-18 04:56:29.071'),
(5491, 748, '2692', 'ข้อที่ 1-10', '1-10-3', 0, 4760, 'video', 'https://player.vimeo.com/video/1121038577?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:29.072', '2026-02-18 04:56:29.072'),
(5492, 748, '2693', 'ข้อที่ 11-20', '11-20-2', 1, 3729, 'video', 'https://player.vimeo.com/video/1121038606?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:29.072', '2026-02-18 04:56:29.072'),
(5493, 748, '2694', 'ข้อที่ 21-30', '21-30-2', 2, 2928, 'video', 'https://player.vimeo.com/video/1121038630?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:29.073', '2026-02-18 04:56:29.073'),
(5494, 748, '2695', 'ข้อที่ 31-40', '31-40-2', 3, 2795, 'video', 'https://player.vimeo.com/video/1121038645?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:29.073', '2026-02-18 04:56:29.073'),
(5495, 748, '2696', 'ข้อที่ 41-50', '41-50-2', 4, 1602, 'video', 'https://player.vimeo.com/video/1121038665?share=copy', 'unknown', NULL, 1, '2026-02-18 04:56:29.073', '2026-02-18 04:56:29.073'),
(5521, 755, '1488', 'วิชาคณิตศาสตร์ ข้อ1-5', '1-5-5', 0, 2118, 'video', 'https://player.vimeo.com/video/1093048744?share=copy', 'unknown', NULL, 1, '2026-02-18 04:58:04.746', '2026-02-18 04:58:04.746'),
(5522, 755, '1489', 'วิชาคณิตศาสตร์ ข้อ6-10', '6-10-5', 1, NULL, 'video', 'https://player.vimeo.com/video/1093047885?share=copy', 'unknown', NULL, 1, '2026-02-18 04:58:04.747', '2026-02-18 04:58:04.747'),
(5523, 755, '1490', 'วิชาคณิตศาสตร์ ข้อ11-15', '11-15-5', 2, 1923, 'video', 'https://player.vimeo.com/video/1093048074?share=copy', 'unknown', NULL, 1, '2026-02-18 04:58:04.748', '2026-02-18 04:58:04.748'),
(5524, 755, '1491', 'วิชาคณิตศาสตร์ ข้อ16-20', '16-20-5', 3, 1364, 'video', 'https://player.vimeo.com/video/1162455821?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:58:04.748', '2026-02-18 04:58:04.748'),
(5525, 755, '1492', 'วิชาคณิตศาสตร์ ข้อ21-25', '21-25-5', 4, NULL, 'video', 'https://player.vimeo.com/video/1093047759?share=copy', 'unknown', NULL, 1, '2026-02-18 04:58:04.749', '2026-02-18 04:58:04.749'),
(5526, 755, '1493', 'วิชาคณิตศาสตร์ ข้อ26-30', '26-30-4', 5, NULL, 'video', 'https://player.vimeo.com/video/1093048663?share=copy', 'unknown', NULL, 1, '2026-02-18 04:58:04.750', '2026-02-18 04:58:04.750'),
(5527, 756, '1495', 'วิชาคณิตศาสตร์ ข้อ1-5', '1-5-6', 0, 2122, 'video', 'https://player.vimeo.com/video/1093048971?share=copy', 'unknown', NULL, 1, '2026-02-18 04:58:04.750', '2026-02-18 04:58:04.750'),
(5528, 756, '1496', 'วิชาคณิตศาสตร์ ข้อ6-10', '6-10-6', 1, NULL, 'video', 'https://player.vimeo.com/video/1093049033?share=copy', 'unknown', NULL, 1, '2026-02-18 04:58:04.751', '2026-02-18 04:58:04.751'),
(5529, 756, '1497', 'วิชาคณิตศาสตร์ ข้อ11-15', '11-15-6', 2, NULL, 'video', 'https://player.vimeo.com/video/1093049114?share=copy', 'unknown', NULL, 1, '2026-02-18 04:58:04.751', '2026-02-18 04:58:04.751'),
(5530, 756, '1498', 'วิชาคณิตศาสตร์ ข้อ16-20', '16-20-6', 3, NULL, 'video', 'https://player.vimeo.com/video/1093049195?share=copy', 'unknown', NULL, 1, '2026-02-18 04:58:04.752', '2026-02-18 04:58:04.752'),
(5531, 756, '1499', 'วิชาคณิตศาสตร์ ข้อ21-25', '21-25-6', 4, NULL, 'video', 'https://player.vimeo.com/video/1093049313?share=copy', 'unknown', NULL, 1, '2026-02-18 04:58:04.752', '2026-02-18 04:58:04.752'),
(5532, 756, '1500', 'วิชาคณิตศาสตร์ ข้อ26-30', '26-30-5', 5, NULL, 'video', 'https://player.vimeo.com/video/1093048870?share=copy', 'unknown', NULL, 1, '2026-02-18 04:58:04.752', '2026-02-18 04:58:04.752'),
(5533, 757, '1243', 'วิชาคณิตศาสตร์ ข้อ1-10', '1-10-2', 0, 1300, 'video', 'https://player.vimeo.com/video/1092407305?share=copy', 'unknown', NULL, 1, '2026-02-18 04:59:46.767', '2026-02-18 04:59:46.767'),
(5534, 757, '1244', 'วิชาคณิตศาสตร์ ข้อ11-20', '11-20-2', 1, 1016, 'video', 'https://player.vimeo.com/video/1092407387?share=copy', 'unknown', NULL, 1, '2026-02-18 04:59:46.768', '2026-02-18 04:59:46.768'),
(5535, 757, '1245', 'วิชาคณิตศาสตร์ ข้อ21-30', '21-30-2', 2, 1355, 'video', 'https://player.vimeo.com/video/1092407494?share=copy', 'unknown', NULL, 1, '2026-02-18 04:59:46.768', '2026-02-18 04:59:46.768'),
(5536, 757, '1246', 'วิชาคณิตศาสตร์ ข้อ31-40', '31-40-2', 3, 1750, 'video', 'https://player.vimeo.com/video/1092407575?share=copy', 'unknown', NULL, 1, '2026-02-18 04:59:46.768', '2026-02-18 04:59:46.768'),
(5537, 758, '1248', 'วิชาฟิสิกส์ ข้อ1-5', '1-5-2', 0, 2890, 'video', 'https://player.vimeo.com/video/1092410482?share=copy', 'unknown', NULL, 1, '2026-02-18 04:59:46.769', '2026-02-18 04:59:46.769'),
(5538, 758, '1249', 'วิชาฟิสิกส์ ข้อ6-10', '6-10-2', 1, 2658, 'video', 'https://player.vimeo.com/video/1092410548?share=copy', 'unknown', NULL, 1, '2026-02-18 04:59:46.769', '2026-02-18 04:59:46.769'),
(5539, 758, '1250', 'วิชาฟิสิกส์ ข้อ11-15', '11-15', 2, 2294, 'video', 'https://player.vimeo.com/video/1092410628?share=copy', 'unknown', NULL, 1, '2026-02-18 04:59:46.770', '2026-02-18 04:59:46.770'),
(5540, 758, '1251', 'วิชาฟิสิกส์ ข้อ16-20', '16-20', 3, 1900, 'video', 'https://player.vimeo.com/video/1092410684?share=copy', 'unknown', NULL, 1, '2026-02-18 04:59:46.770', '2026-02-18 04:59:46.770'),
(5541, 759, '1253', 'วิชาเคมี ข้อ1-5', '1-5', 0, 2084, 'video', 'https://player.vimeo.com/video/1092409979?share=copy', 'unknown', NULL, 1, '2026-02-18 04:59:46.772', '2026-02-18 04:59:46.772'),
(5542, 759, '1254', 'วิชาเคมี ข้อ6-10', '6-10', 1, 2514, 'video', 'https://player.vimeo.com/video/1092410114?share=copy', 'unknown', NULL, 1, '2026-02-18 04:59:46.772', '2026-02-18 04:59:46.772'),
(5543, 759, '1255', 'วิชาเคมี ข้อ11-15', '11-15-2', 2, 2514, 'video', 'https://player.vimeo.com/video/1092410244', 'unknown', NULL, 1, '2026-02-18 04:59:46.773', '2026-02-18 04:59:46.773'),
(5544, 759, '1256', 'วิชาเคมี ข้อ16-20', '16-20-2', 3, 1971, 'video', 'https://player.vimeo.com/video/1092410308?share=copy', 'unknown', NULL, 1, '2026-02-18 04:59:46.773', '2026-02-18 04:59:46.773'),
(5545, 759, '1257', 'วิชาเคมี ข้อ21-25', '21-25', 4, 1531, 'video', 'https://player.vimeo.com/video/1092410404?share=copy', 'unknown', NULL, 1, '2026-02-18 04:59:46.774', '2026-02-18 04:59:46.774'),
(5546, 760, '1259', 'วิชาชีววิทยา ข้อ1-5', '1-5-2-3', 0, 1960, 'video', 'https://player.vimeo.com/video/1092408336?share=copy', 'unknown', NULL, 1, '2026-02-18 04:59:46.774', '2026-02-18 04:59:46.774'),
(5547, 760, '1260', 'วิชาชีววิทยา ข้อ6-10', '6-10-2-3', 1, 3016, 'video', 'https://player.vimeo.com/video/1092408440?share=copy', 'unknown', NULL, 1, '2026-02-18 04:59:46.775', '2026-02-18 04:59:46.775'),
(5548, 760, '1261', 'วิชาชีววิทยา ข้อ11-15', '11-15-2-3', 2, 4055, 'video', 'https://player.vimeo.com/video/1092408677?share=copy', 'unknown', NULL, 1, '2026-02-18 04:59:46.775', '2026-02-18 04:59:46.775'),
(5549, 760, '1262', 'วิชาชีววิทยา ข้อ16-20', '16-20-2-3', 3, NULL, 'video', 'https://player.vimeo.com/video/1092408837?share=copy', 'unknown', NULL, 1, '2026-02-18 04:59:46.775', '2026-02-18 04:59:46.775'),
(5550, 760, '1263', 'วิชาชีววิทยา ข้อ21-30', '21-30', 4, 1561, 'video', 'https://player.vimeo.com/video/1092408953?share=copy', 'unknown', NULL, 1, '2026-02-18 04:59:46.776', '2026-02-18 04:59:46.776'),
(5551, 761, '1265', 'วิชาภาษาอังกฤษ ข้อ1-20', '1-20-2', 0, 2423, 'video', 'https://player.vimeo.com/video/1092409195?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-18 04:59:46.779', '2026-02-18 04:59:46.779'),
(5552, 761, '1266', 'วิชาภาษาอังกฤษ ข้อ21-40', '21-40-2', 1, 1833, 'video', 'https://player.vimeo.com/video/1092409337?share=copy', 'unknown', NULL, 1, '2026-02-18 04:59:46.779', '2026-02-18 04:59:46.779'),
(5553, 762, '1268', 'วิชาภาษาไทย ข้อ1-3', '1-3-2', 0, 1413, 'video', 'https://player.vimeo.com/video/1092409394?share=copy', 'unknown', NULL, 1, '2026-02-18 04:59:46.780', '2026-02-18 04:59:46.780'),
(5554, 762, '1269', 'วิชาภาษาไทย ข้อ4-9', '4-9-2', 1, 2158, 'video', 'https://player.vimeo.com/video/1092409462?share=copy', 'unknown', NULL, 1, '2026-02-18 04:59:46.780', '2026-02-18 04:59:46.780'),
(5555, 762, '1270', 'วิชาภาษาไทย ข้อ10-15', '10-15-2', 2, 2340, 'video', 'https://player.vimeo.com/video/1092409528?share=copy', 'unknown', NULL, 1, '2026-02-18 04:59:46.781', '2026-02-18 04:59:46.781'),
(5556, 762, '1271', 'วิชาภาษาไทย ข้อ16-20', '16-20-2-2', 3, 1568, 'video', 'https://player.vimeo.com/video/1092409826?share=copy', 'unknown', NULL, 1, '2026-02-18 04:59:46.781', '2026-02-18 04:59:46.781'),
(5557, 762, '1273', 'วิชาภาษาไทย ข้อ21-30', '21-30-2-2', 4, 2032, 'video', 'https://player.vimeo.com/video/1092409888?share=copy', 'unknown', NULL, 1, '2026-02-18 04:59:46.781', '2026-02-18 04:59:46.781'),
(5558, 763, '1483', 'วิชาฟิสิกส์ ข้อ1-10', '1-10', 0, 3677, 'video', 'https://player.vimeo.com/video/1079693107?share=copy', 'unknown', NULL, 1, '2026-02-18 05:00:00.706', '2026-02-18 05:00:00.706'),
(5559, 763, '1484', 'วิชาฟิสิกส์ ข้อ11-20', '11-20', 1, NULL, 'video', 'https://player.vimeo.com/video/1079693367?share=copy', 'unknown', NULL, 1, '2026-02-18 05:00:00.706', '2026-02-18 05:00:00.706'),
(5560, 763, '1485', 'วิชาฟิสิกส์ ข้อ21-30', '21-30', 2, NULL, 'video', 'https://player.vimeo.com/video/1079693635?share=copy', 'unknown', NULL, 1, '2026-02-18 05:00:00.706', '2026-02-18 05:00:00.706'),
(5561, 764, '1506', 'วิชาเคมี ข้อ1-10', '1-10-2', 0, 2573, 'video', 'https://player.vimeo.com/video/1079692846?share=copy', 'unknown', NULL, 1, '2026-02-18 05:00:59.637', '2026-02-18 05:00:59.637'),
(5562, 764, '1507', 'วิชาเคมี ข้อ11-20', '11-20', 1, 3155, 'video', 'https://player.vimeo.com/video/1079692959?share=copy', 'unknown', NULL, 1, '2026-02-18 05:00:59.638', '2026-02-18 05:00:59.638'),
(5563, 764, '1508', 'วิชาเคมี ข้อ21-30', '21-30', 2, 2024, 'video', 'https://player.vimeo.com/video/1079692646?share=copy', 'unknown', NULL, 1, '2026-02-18 05:00:59.638', '2026-02-18 05:00:59.638'),
(5564, 764, '1509', 'วิชาเคมี ข้อ31-35', '31-35-2', 3, 3408, 'video', 'https://player.vimeo.com/video/1079692724?share=copy', 'unknown', NULL, 1, '2026-02-18 05:00:59.638', '2026-02-18 05:00:59.638'),
(5565, 765, '1536', 'วิชาภาษาอังกฤษ ข้อ1-20', '1-20-3', 0, 2107, 'video', 'https://player.vimeo.com/video/1079685629', 'unknown', NULL, 1, '2026-02-18 05:01:50.783', '2026-02-18 05:01:50.783'),
(5566, 765, '1537', 'วิชาภาษาอังกฤษ ข้อ21-32', '21-32', 1, 1682, 'video', 'https://player.vimeo.com/video/1079685709', 'unknown', NULL, 1, '2026-02-18 05:01:50.783', '2026-02-18 05:01:50.783'),
(5567, 765, '1538', 'วิชาภาษาอังกฤษ ข้อ33-44', '33-44', 2, 1559, 'video', 'https://player.vimeo.com/video/1079685416', 'unknown', NULL, 1, '2026-02-18 05:01:50.784', '2026-02-18 05:01:50.784'),
(5568, 765, '1539', 'วิชาภาษาอังกฤษ ข้อ45-60', '45-60', 3, NULL, 'video', 'https://player.vimeo.com/video/1079685491', 'unknown', NULL, 1, '2026-02-18 05:01:50.784', '2026-02-18 05:01:50.784'),
(5569, 765, '18426', 'วิชาภาษาอังกฤษ ข้อ 61-75', '61-75', 4, 2094, 'video', 'https://player.vimeo.com/video/1163525819', 'unknown', NULL, 1, '2026-02-18 05:01:50.785', '2026-02-18 05:01:50.785'),
(5570, 765, '18427', 'วิชาภาษาอังกฤษ ข้อ 76-80', '76-80', 5, 1415, 'video', 'https://player.vimeo.com/video/1163525780', 'unknown', NULL, 1, '2026-02-18 05:01:50.785', '2026-02-18 05:01:50.785'),
(5571, 766, '1541', 'วิชาภาษาอังกฤษ ข้อ1-20', '1-20-4', 0, 2800, 'video', 'https://player.vimeo.com/video/1079688432', 'unknown', NULL, 1, '2026-02-18 05:01:50.785', '2026-02-18 05:01:50.785'),
(5572, 766, '1542', 'วิชาภาษาอังกฤษ ข้อ21-23', '21-23', 1, NULL, 'video', 'https://player.vimeo.com/video/1079685961', 'unknown', NULL, 1, '2026-02-18 05:01:50.786', '2026-02-18 05:01:50.786'),
(5573, 766, '1543', 'วิชาภาษาอังกฤษ ข้อ24-26', '24-26', 2, NULL, 'video', 'https://player.vimeo.com/video/1079686164', 'unknown', NULL, 1, '2026-02-18 05:01:50.786', '2026-02-18 05:01:50.786'),
(5574, 766, '1544', 'วิชาภาษาอังกฤษ ข้อ27-32', '27-32-4', 3, NULL, 'video', 'https://player.vimeo.com/video/1079686507', 'unknown', NULL, 1, '2026-02-18 05:01:50.786', '2026-02-18 05:01:50.786'),
(5575, 766, '1545', 'วิชาภาษาอังกฤษ ข้อ33-38', '33-38-4', 4, NULL, 'video', 'https://player.vimeo.com/video/1079686894', 'unknown', NULL, 1, '2026-02-18 05:01:50.787', '2026-02-18 05:01:50.787'),
(5576, 766, '1546', 'วิชาภาษาอังกฤษ ข้อ39-44', '39-44-2', 5, NULL, 'video', 'https://player.vimeo.com/video/1079687671', 'unknown', NULL, 1, '2026-02-18 05:01:50.787', '2026-02-18 05:01:50.787'),
(5577, 766, '1547', 'วิชาภาษาอังกฤษ ข้อ45-52', '45-52-2', 6, NULL, 'video', 'https://player.vimeo.com/video/1079687743', 'unknown', NULL, 1, '2026-02-18 05:01:50.787', '2026-02-18 05:01:50.787'),
(5578, 766, '1548', 'วิชาภาษาอังกฤษ ข้อ53-60', '53-60-4', 7, NULL, 'video', 'https://player.vimeo.com/video/1079687855', 'unknown', NULL, 1, '2026-02-18 05:01:50.788', '2026-02-18 05:01:50.788'),
(5579, 766, '1549', 'วิชาภาษาอังกฤษ ข้อ61-80', '61-80', 8, 3588, 'video', 'https://player.vimeo.com/video/1079688242', 'unknown', NULL, 1, '2026-02-18 05:01:50.788', '2026-02-18 05:01:50.788'),
(5580, 767, '1551', 'สรุปเนื้อหา EP.1', 'ep-1', 0, 2694, 'video', 'https://player.vimeo.com/video/1079691992?share=copy', 'unknown', NULL, 1, '2026-02-18 05:01:50.789', '2026-02-18 05:01:50.789'),
(5581, 767, '1552', 'สรุปเนื้อหา EP.2', 'ep-2', 1, 1595, 'video', 'https://player.vimeo.com/video/1079692109?share=copy', 'unknown', NULL, 1, '2026-02-18 05:01:50.790', '2026-02-18 05:01:50.790'),
(5582, 767, '1553', 'สรุปเนื้อหา EP.3', 'ep-3', 2, 1348, 'video', 'https://player.vimeo.com/video/1079688606?share=copy', 'unknown', NULL, 1, '2026-02-18 05:01:50.790', '2026-02-18 05:01:50.790'),
(5583, 767, '1554', 'สรุปเนื้อหา EP.4-5', 'ep-4-5', 3, 1046, 'video', 'https://player.vimeo.com/video/1079688741?share=copy', 'unknown', NULL, 1, '2026-02-18 05:01:50.790', '2026-02-18 05:01:50.790'),
(5584, 767, '1555', 'สรุปเนื้อหา EP.6', 'ep-6', 4, 2306, 'video', 'https://player.vimeo.com/video/1093066444?share=copy', 'unknown', NULL, 1, '2026-02-18 05:01:50.791', '2026-02-18 05:01:50.791'),
(5585, 767, '1556', 'สรุปเนื้อหา EP.7', 'ep-7', 5, 1598, 'video', 'https://player.vimeo.com/video/1079688917?share=copy', 'unknown', NULL, 1, '2026-02-18 05:01:50.791', '2026-02-18 05:01:50.791'),
(5586, 767, '1557', 'สรุปเนื้อหา EP.8', 'ep-8', 6, 1429, 'video', 'https://player.vimeo.com/video/1079689187?share=copy', 'unknown', NULL, 1, '2026-02-18 05:01:50.791', '2026-02-18 05:01:50.791'),
(5587, 767, '1558', 'สรุปเนื้อหา EP.9', 'ep-9', 7, 2588, 'video', 'https://player.vimeo.com/video/1079689285?share=copy', 'unknown', NULL, 1, '2026-02-18 05:01:50.791', '2026-02-18 05:01:50.791'),
(5588, 767, '1559', 'สรุปเนื้อหา EP.10', 'ep-10', 8, 1579, 'video', 'https://player.vimeo.com/video/1079689426?share=copy', 'unknown', NULL, 1, '2026-02-18 05:01:50.792', '2026-02-18 05:01:50.792'),
(5589, 767, '1560', 'สรุปเนื้อหา EP.11', 'ep-11', 9, 2037, 'video', 'https://player.vimeo.com/video/1079689875?share=copy', 'unknown', NULL, 1, '2026-02-18 05:01:50.792', '2026-02-18 05:01:50.792'),
(5590, 767, '1561', 'สรุปเนื้อหา EP.12', 'ep-12', 10, 1436, 'video', 'https://player.vimeo.com/video/1079690024?share=copy', 'unknown', NULL, 1, '2026-02-18 05:01:50.792', '2026-02-18 05:01:50.792'),
(5591, 767, '1562', 'สรุปเนื้อหา EP.13', 'ep-13', 11, 2491, 'video', 'https://player.vimeo.com/video/1079690117?share=copy', 'unknown', NULL, 1, '2026-02-18 05:01:50.793', '2026-02-18 05:01:50.793');
INSERT INTO `lessons` (`id`, `module_id`, `public_id`, `title`, `slug`, `lesson_order`, `duration_seconds`, `type`, `video_url`, `video_provider`, `content_html`, `is_active`, `created_at`, `updated_at`) VALUES
(5592, 767, '1563', 'สรุปเนื้อหา EP.14', 'ep-14', 12, NULL, 'video', 'https://player.vimeo.com/video/1079690272?share=copy', 'unknown', NULL, 1, '2026-02-18 05:01:50.793', '2026-02-18 05:01:50.793'),
(5593, 767, '1564', 'สรุปเนื้อหา EP.15', 'ep-15', 13, NULL, 'video', 'https://player.vimeo.com/video/1079690684?share=copy', 'unknown', NULL, 1, '2026-02-18 05:01:50.793', '2026-02-18 05:01:50.793'),
(5594, 767, '1565', 'สรุปเนื้อหา EP.16', 'ep-16', 14, NULL, 'video', 'https://player.vimeo.com/video/1079691580?share=copy', 'unknown', NULL, 1, '2026-02-18 05:01:50.794', '2026-02-18 05:01:50.794'),
(5595, 767, '1566', 'สรุปเนื้อหา EP.17/1', 'ep-17-1', 15, NULL, 'video', 'https://player.vimeo.com/video/1079691690?share=copy', 'unknown', NULL, 1, '2026-02-18 05:01:50.794', '2026-02-18 05:01:50.794'),
(5596, 767, '1567', 'สรุปเนื้อหา EP.17/2', 'ep-17-2', 16, NULL, 'video', 'https://player.vimeo.com/video/1079691839?share=copy', 'unknown', NULL, 1, '2026-02-18 05:01:50.794', '2026-02-18 05:01:50.794'),
(5597, 768, '1514', 'วิชาชีววิทยา ข้อ1-10', '1-10-3', 0, 2836, 'video', 'https://player.vimeo.com/video/1079692513?share=copy', 'unknown', NULL, 1, '2026-02-18 05:02:33.032', '2026-02-18 05:02:33.032'),
(5598, 768, '1515', 'วิชาชีววิทยา ข้อ11-20', '11-20', 1, NULL, 'video', 'https://player.vimeo.com/video/1079692169?share=copy', 'unknown', NULL, 1, '2026-02-18 05:02:33.032', '2026-02-18 05:02:33.032'),
(5599, 768, '1516', 'วิชาชีววิทยา ข้อ21-30', '21-30-4', 2, NULL, 'video', 'https://player.vimeo.com/video/1079692272?share=copy', 'unknown', NULL, 1, '2026-02-18 05:02:33.033', '2026-02-18 05:02:33.033'),
(5600, 768, '1517', 'วิชาชีววิทยา ข้อ31-40', '31-40-3', 3, NULL, 'video', 'https://player.vimeo.com/video/1079692366?share=copy', 'unknown', NULL, 1, '2026-02-18 05:02:33.033', '2026-02-18 05:02:33.033'),
(5624, 774, '1522', 'วิชาสังคมศึกษา ข้อ1-10', '1-10-3', 0, 2104, 'video', 'https://player.vimeo.com/video/1079684152', 'unknown', NULL, 1, '2026-02-18 05:04:30.936', '2026-02-18 05:04:30.936'),
(5625, 774, '1523', 'วิชาสังคมศึกษา ข้อ11-20', '11-20-3', 1, 1463, 'video', 'https://player.vimeo.com/video/1079683538?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:30.936', '2026-02-18 05:04:30.936'),
(5626, 774, '1524', 'วิชาสังคมศึกษา ข้อ21-30', '21-30-3', 2, 1784, 'video', 'https://player.vimeo.com/video/1079683691?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:30.937', '2026-02-18 05:04:30.937'),
(5627, 774, '1526', 'วิชาสังคมศึกษา ข้อ31-50', '31-50', 3, 3314, 'video', 'https://player.vimeo.com/video/1079683910?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:30.937', '2026-02-18 05:04:30.937'),
(5628, 775, '1528', 'วิชาภาษาไทย ข้อ1-10', '1-10-4', 0, 2598, 'video', 'https://player.vimeo.com/video/1079682813?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:30.938', '2026-02-18 05:04:30.938'),
(5629, 775, '1529', 'วิชาภาษาไทย ข้อ11-20', '11-20-4', 1, NULL, 'video', 'https://player.vimeo.com/video/1079682904?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:30.939', '2026-02-18 05:04:30.939'),
(5630, 775, '1530', 'วิชาภาษาไทย ข้อ21-40', '21-40', 2, NULL, 'video', 'https://player.vimeo.com/video/1079683008?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:30.939', '2026-02-18 05:04:30.939'),
(5631, 775, '1531', 'วิชาภาษาไทย ข้อ41-50', '41-50-3', 3, NULL, 'video', 'https://player.vimeo.com/video/1079683166?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:30.940', '2026-02-18 05:04:30.940'),
(5632, 776, '956', '1. Noun', '1-noun', 0, 2438, 'video', 'https://player.vimeo.com/video/1079726727?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.857', '2026-02-18 05:04:32.857'),
(5633, 776, '8121', '2.Determiners Part 1', '2-determiners-part-1', 1, 376, 'video', 'https://player.vimeo.com/video/1079726431?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.857', '2026-02-18 05:04:32.857'),
(5634, 776, '8122', '3.Determiners Part 2', '3-determiners-part-2', 2, 1611, 'video', 'https://player.vimeo.com/video/1079726481?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.858', '2026-02-18 05:04:32.858'),
(5635, 776, '8123', '4.Pronoun', '4-pronoun', 3, 842, 'video', 'https://player.vimeo.com/video/1079727008?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.858', '2026-02-18 05:04:32.858'),
(5636, 776, '8124', '5.Verb Part 1', '5-verb-part-1', 4, 670, 'video', 'https://player.vimeo.com/video/1079727693?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.858', '2026-02-18 05:04:32.858'),
(5637, 776, '8125', '6.Verb Part 2', '6-verb-part-2', 5, 792, 'video', 'https://player.vimeo.com/video/1079727781?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.859', '2026-02-18 05:04:32.859'),
(5638, 776, '8126', '7.Adjective', '7-adjective', 6, 714, 'video', 'https://player.vimeo.com/video/1079725984?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.859', '2026-02-18 05:04:32.859'),
(5639, 776, '8127', '8.Adverb', '8-adverb', 7, 559, 'video', 'https://player.vimeo.com/video/1079726120?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.859', '2026-02-18 05:04:32.859'),
(5640, 776, '8129', '9.Preposition', '9-preposition', 8, 956, 'video', 'https://player.vimeo.com/video/1137114032?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.860', '2026-02-18 05:04:32.860'),
(5641, 776, '8130', '10.Conjunction', '10-conjunction', 9, 1367, 'video', 'https://player.vimeo.com/video/1079726254?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.860', '2026-02-18 05:04:32.860'),
(5642, 776, '8131', '11.Interjection', '11-interjection', 10, 372, 'video', 'https://player.vimeo.com/video/1079726659?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.860', '2026-02-18 05:04:32.860'),
(5643, 776, '8132', '12.Sentence', '12-sentence', 11, 1456, 'video', 'https://player.vimeo.com/video/1079727100?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.860', '2026-02-18 05:04:32.860'),
(5644, 776, '8133', '13.Subject and Verb Agreement', '13-subject-and-verb-agreement', 12, 1423, 'video', 'https://player.vimeo.com/video/1079727229?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.861', '2026-02-18 05:04:32.861'),
(5645, 776, '8135', '14.Tense Part 1', '14-tense-part-1', 13, 572, 'video', 'https://player.vimeo.com/video/1079727390?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.861', '2026-02-18 05:04:32.861'),
(5646, 776, '8136', '15.Tense Part 2', '15-tense-part-2', 14, 415, 'video', 'https://player.vimeo.com/video/1079727440?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.861', '2026-02-18 05:04:32.861'),
(5647, 776, '8138', '16.Tense Part 3', '16-tense-part-3', 15, 177, 'video', 'https://player.vimeo.com/video/1079727493?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.862', '2026-02-18 05:04:32.862'),
(5648, 776, '8139', '17.Tense Part 4', '17-tense-part-4', 16, 1391, 'video', 'https://player.vimeo.com/video/1079727531?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.862', '2026-02-18 05:04:32.862'),
(5649, 777, '958', 'ข้อที่ 1-10', '1-10', 0, 1100, 'video', 'https://player.vimeo.com/video/1079727930?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.863', '2026-02-18 05:04:32.863'),
(5650, 777, '8141', 'ข้อที่ 11-20', '11-20-3', 1, 1689, 'video', 'https://player.vimeo.com/video/1079728534?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.866', '2026-02-18 05:04:32.866'),
(5651, 777, '8142', 'ข้อที่ 21-25 Part1', '21-25-part1', 2, 1627, 'video', 'https://player.vimeo.com/video/1079729641?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.867', '2026-02-18 05:04:32.867'),
(5652, 777, '8143', 'ข้อที่ 21-25 Part2', '21-25-part2', 3, 364, 'video', 'https://player.vimeo.com/video/1079730346?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.867', '2026-02-18 05:04:32.867'),
(5653, 777, '8144', 'ข้อที่ 26-30', '26-30-3', 4, 2516, 'video', 'https://player.vimeo.com/video/1079730756?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.868', '2026-02-18 05:04:32.868'),
(5654, 777, '8145', 'ข้อที่ 31-38 Part1', '31-38-part1', 5, 3015, 'video', 'https://player.vimeo.com/video/1079736307?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.868', '2026-02-18 05:04:32.868'),
(5655, 777, '8146', 'ข้อที่ 31-38 Part2', '31-38-part2', 6, 1765, 'video', 'https://player.vimeo.com/video/1079736643?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.869', '2026-02-18 05:04:32.869'),
(5656, 777, '8148', 'ข้อที่ 39-45 Part1', '39-45-part1', 7, 3127, 'video', 'https://player.vimeo.com/video/1079737202?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.869', '2026-02-18 05:04:32.869'),
(5657, 777, '8149', 'ข้อที่ 39-45 Part2', '39-45-part2', 8, 478, 'video', 'https://player.vimeo.com/video/1079737520?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.869', '2026-02-18 05:04:32.869'),
(5658, 777, '8150', 'ข้อที่ 39-45 Part3', '39-45-part3', 9, 182, 'video', 'https://player.vimeo.com/video/1079737614?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.870', '2026-02-18 05:04:32.870'),
(5659, 777, '8151', 'ข้อที่ 46-50 Part1', '46-50-part1', 10, 2423, 'video', 'https://player.vimeo.com/video/1079737649?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.870', '2026-02-18 05:04:32.870'),
(5660, 777, '8152', 'ข้อที่ 46-50 Part2', '46-50-part2', 11, 449, 'video', 'https://player.vimeo.com/video/1079738200?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.870', '2026-02-18 05:04:32.870'),
(5661, 778, '8153', 'ข้อที่ 1-10', '1-10-4', 0, 2708, 'video', 'https://player.vimeo.com/video/1079728048?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.871', '2026-02-18 05:04:32.871'),
(5662, 778, '8154', 'ข้อที่ 11-16', '11-16', 1, 2049, 'video', 'https://player.vimeo.com/video/1079728303?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.872', '2026-02-18 05:04:32.872'),
(5663, 778, '8155', 'ข้อที่ 17', '17', 2, 288, 'video', 'https://player.vimeo.com/video/1079728783?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.872', '2026-02-18 05:04:32.872'),
(5664, 778, '8156', 'ข้อที่ 18-20', '18-20', 3, NULL, 'video', 'https://player.vimeo.com/video/1079728890?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.872', '2026-02-18 05:04:32.872'),
(5665, 778, '8157', 'ข้อที่ 21-25', '21-25-2', 4, NULL, 'video', 'https://player.vimeo.com/video/1079730660?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.873', '2026-02-18 05:04:32.873'),
(5666, 778, '960', 'ข้อที่ 26-30', '26-30', 5, 1351, 'video', 'https://player.vimeo.com/video/1079732576?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.874', '2026-02-18 05:04:32.874'),
(5667, 778, '8165', 'ข้อที่ 31-34 Part1', '31-34-part1', 6, 2969, 'video', 'https://player.vimeo.com/video/1079734573?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.874', '2026-02-18 05:04:32.874'),
(5668, 778, '8164', 'ข้อที่ 31-34 Part2', '31-34-part2', 7, 532, 'video', 'https://player.vimeo.com/video/1079736211?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.874', '2026-02-18 05:04:32.874'),
(5669, 778, '8160', 'ข้อที่ 35-40', '35-40', 8, 2997, 'video', 'https://player.vimeo.com/video/1079736829?share=copy', 'unknown', NULL, 1, '2026-02-18 05:04:32.875', '2026-02-18 05:04:32.875'),
(5670, 779, '1211', 'วิชาคณิตศาสตร์ ข้อ1-10', '1-10', 0, 762, 'video', 'https://player.vimeo.com/video/1092401421?share=copy', 'unknown', NULL, 1, '2026-02-18 05:05:47.447', '2026-02-18 05:05:47.447'),
(5671, 779, '1212', 'วิชาคณิตศาสตร์ ข้อ11-20', '11-20', 1, 628, 'video', 'https://player.vimeo.com/video/1092401587?share=copy', 'unknown', NULL, 1, '2026-02-18 05:05:47.447', '2026-02-18 05:05:47.447'),
(5672, 779, '1213', 'วิชาคณิตศาสตร์ ข้อ21-30', '21-30', 2, 687, 'video', 'https://player.vimeo.com/video/1092401692?share=copy', 'unknown', NULL, 1, '2026-02-18 05:05:47.447', '2026-02-18 05:05:47.447'),
(5673, 779, '1214', 'วิชาคณิตศาสตร์ ข้อ31-40', '31-40', 3, 815, 'video', 'https://player.vimeo.com/video/1092401733?share=copy', 'unknown', NULL, 1, '2026-02-18 05:05:47.448', '2026-02-18 05:05:47.448'),
(5674, 780, '1216', 'วิชาฟิสิกส์ ข้อ1-5', '1-5', 0, 815, 'video', 'https://player.vimeo.com/video/1092402089', 'unknown', NULL, 1, '2026-02-18 05:05:47.448', '2026-02-18 05:05:47.448'),
(5675, 780, '1218', 'วิชาฟิสิกส์ ข้อ6-10', '6-10', 1, 1401, 'video', 'https://player.vimeo.com/video/1092402186?share=copy', 'unknown', NULL, 1, '2026-02-18 05:05:47.449', '2026-02-18 05:05:47.449'),
(5676, 780, '1219', 'วิชาฟิสิกส์ ข้อ11-14', '11-14', 2, 1070, 'video', 'https://player.vimeo.com/video/1092402416?share=copy', 'unknown', NULL, 1, '2026-02-18 05:05:47.449', '2026-02-18 05:05:47.449'),
(5677, 780, '1220', 'วิชาฟิสิกส์ ข้อ15-20', '15-20', 3, 2168, 'video', 'https://player.vimeo.com/video/1092402554?share=copy', 'unknown', NULL, 1, '2026-02-18 05:05:47.450', '2026-02-18 05:05:47.450'),
(5678, 781, '1222', 'วิชาภาษาไทย ข้อ1-3', '1-3', 0, NULL, 'video', 'https://player.vimeo.com/video/1092747371?share=copy', 'unknown', NULL, 1, '2026-02-18 05:05:47.450', '2026-02-18 05:05:47.450'),
(5679, 781, '1223', 'วิชาภาษาไทย ข้อ4-9', '4-9', 1, NULL, 'video', 'https://player.vimeo.com/video/1092747293?share=copy', 'unknown', NULL, 1, '2026-02-18 05:05:47.451', '2026-02-18 05:05:47.451'),
(5680, 781, '1224', 'วิชาภาษาไทย ข้อ10-15', '10-15', 2, 2340, 'video', 'https://player.vimeo.com/video/1092747197?share=copy', 'unknown', NULL, 1, '2026-02-18 05:05:47.451', '2026-02-18 05:05:47.451'),
(5681, 781, '1225', 'วิชาภาษาไทย ข้อ16-20', '16-20', 3, NULL, 'video', 'https://player.vimeo.com/video/1092747119?share=copy', 'unknown', NULL, 1, '2026-02-18 05:05:47.452', '2026-02-18 05:05:47.452'),
(5682, 781, '1226', 'วิชาภาษาไทย ข้อ21-30', '21-30-2', 4, NULL, 'video', 'https://player.vimeo.com/video/1092747081?share=copy', 'unknown', NULL, 1, '2026-02-18 05:05:47.452', '2026-02-18 05:05:47.452'),
(5683, 782, '1228', 'วิชาภาษาอังกฤษ ข้อ1-20', '1-20', 0, 2320, 'video', 'https://player.vimeo.com/video/1092404771?share=copy', 'unknown', NULL, 1, '2026-02-18 05:05:47.453', '2026-02-18 05:05:47.453'),
(5684, 782, '1229', 'วิชาภาษาอังกฤษ ข้อ21-40', '21-40', 1, 1612, 'video', 'https://player.vimeo.com/video/1092404826?share=copy', 'unknown', NULL, 1, '2026-02-18 05:05:47.454', '2026-02-18 05:05:47.454'),
(5685, 783, '1231', 'TPAT3 ข้อ1-10', 'tpat3-1-10', 0, 1917, 'video', 'https://player.vimeo.com/video/1092404125?share=copy', 'unknown', NULL, 1, '2026-02-18 05:05:47.454', '2026-02-18 05:05:47.454'),
(5686, 783, '1232', 'TPAT3 ข้อ11-20', 'tpat3-11-20', 1, 1956, 'video', 'https://player.vimeo.com/video/1092404213?share=copy', 'unknown', NULL, 1, '2026-02-18 05:05:47.455', '2026-02-18 05:05:47.455'),
(5687, 783, '1233', 'TPAT3 ข้อ21-30', 'tpat3-21-30', 2, 2015, 'video', 'https://player.vimeo.com/video/1092404298?share=copy', 'unknown', NULL, 1, '2026-02-18 05:05:47.455', '2026-02-18 05:05:47.455'),
(5688, 783, '1234', 'TPAT3 ข้อ31-35', 'tpat3-31-35', 3, 2615, 'video', 'https://player.vimeo.com/video/1092404360?share=copy', 'unknown', NULL, 1, '2026-02-18 05:05:47.456', '2026-02-18 05:05:47.456'),
(5689, 783, '1235', 'TPAT3 ข้อ36-40', 'tpat3-36-40', 4, 1611, 'video', 'https://player.vimeo.com/video/1092750373?share=copy', 'unknown', NULL, 1, '2026-02-18 05:05:47.456', '2026-02-18 05:05:47.456'),
(5690, 783, '1236', 'TPAT3 ข้อ41-50', 'tpat3-41-50', 5, 3310, 'video', 'https://player.vimeo.com/video/1092404418?share=copy', 'unknown', NULL, 1, '2026-02-18 05:05:47.456', '2026-02-18 05:05:47.456'),
(5691, 783, '1237', 'TPAT3 ข้อ51-60', 'tpat3-51-60', 6, 2093, 'video', 'https://player.vimeo.com/video/1092404529?share=copy', 'unknown', NULL, 1, '2026-02-18 05:05:47.457', '2026-02-18 05:05:47.457'),
(5692, 783, '1238', 'TPAT3 ข้อ61-70', 'tpat3-61-70', 7, 2542, 'video', 'https://player.vimeo.com/video/1092404573?share=copy', 'unknown', NULL, 1, '2026-02-18 05:05:47.457', '2026-02-18 05:05:47.457'),
(6145, 800, '969', 'วิชาคณิตศาสตร์ ข้อ1', '1', 0, 246, 'video', 'https://player.vimeo.com/video/1092394785?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.567', '2026-02-18 06:27:39.567'),
(6146, 800, '971', 'วิชาคณิตศาสตร์ ข้อ2', '2', 1, 511, 'video', 'https://player.vimeo.com/video/1092394826?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.569', '2026-02-18 06:27:39.569'),
(6147, 800, '972', 'วิชาคณิตศาสตร์ ข้อ3', '3', 2, 122, 'video', 'https://player.vimeo.com/video/1092394872?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.569', '2026-02-18 06:27:39.569'),
(6148, 800, '973', 'วิชาคณิตศาสตร์ ข้อ4', '4', 3, 236, 'video', 'https://player.vimeo.com/video/1092394904?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.570', '2026-02-18 06:27:39.570'),
(6149, 800, '974', 'วิชาคณิตศาสตร์ ข้อ5', '5', 4, 93, 'video', 'https://player.vimeo.com/video/1092394947?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.570', '2026-02-18 06:27:39.570'),
(6150, 800, '975', 'วิชาคณิตศาสตร์ ข้อ6', '6', 5, 86, 'video', 'https://player.vimeo.com/video/1092394966?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.571', '2026-02-18 06:27:39.571'),
(6151, 800, '976', 'วิชาคณิตศาสตร์ ข้อ7', '7', 6, 280, 'video', 'https://player.vimeo.com/video/1092394990?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.571', '2026-02-18 06:27:39.571'),
(6152, 800, '977', 'วิชาคณิตศาสตร์ ข้อ8', '8', 7, 154, 'video', 'https://player.vimeo.com/video/1092395019?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.572', '2026-02-18 06:27:39.572'),
(6153, 800, '978', 'วิชาคณิตศาสตร์ ข้อ9', '9', 8, 149, 'video', 'https://player.vimeo.com/video/1092395048?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.572', '2026-02-18 06:27:39.572'),
(6154, 800, '979', 'วิชาคณิตศาสตร์ ข้อ10', '10', 9, 163, 'video', 'https://player.vimeo.com/video/1092395083?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.573', '2026-02-18 06:27:39.573'),
(6155, 800, '980', 'วิชาคณิตศาสตร์ ข้อ11', '11', 10, 297, 'video', 'https://player.vimeo.com/video/1092395123?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.573', '2026-02-18 06:27:39.573'),
(6156, 800, '981', 'วิชาคณิตศาสตร์ ข้อ12', '12', 11, 106, 'video', 'https://player.vimeo.com/video/1092395171?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.574', '2026-02-18 06:27:39.574'),
(6157, 800, '982', 'วิชาคณิตศาสตร์ ข้อ13', '13', 12, 126, 'video', 'https://player.vimeo.com/video/1092395192?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.574', '2026-02-18 06:27:39.574'),
(6158, 800, '983', 'วิชาคณิตศาสตร์ ข้อ14', '14', 13, 80, 'video', 'https://player.vimeo.com/video/1092395232?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.575', '2026-02-18 06:27:39.575'),
(6159, 800, '984', 'วิชาคณิตศาสตร์ ข้อ15', '15', 14, 141, 'video', 'https://player.vimeo.com/video/1092395261?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.575', '2026-02-18 06:27:39.575'),
(6160, 800, '985', 'วิชาคณิตศาสตร์ ข้อ16', '16', 15, 159, 'video', 'https://player.vimeo.com/video/1092395296?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.576', '2026-02-18 06:27:39.576'),
(6161, 800, '986', 'วิชาคณิตศาสตร์ ข้อ17', '17', 16, 155, 'video', 'https://player.vimeo.com/video/1092395329?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.577', '2026-02-18 06:27:39.577'),
(6162, 800, '987', 'วิชาคณิตศาสตร์ ข้อ18', '18', 17, 155, 'video', 'https://player.vimeo.com/video/1092395375?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.578', '2026-02-18 06:27:39.578'),
(6163, 800, '988', 'วิชาคณิตศาสตร์ ข้อ19', '19', 18, 155, 'video', 'https://player.vimeo.com/video/1092395410?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.578', '2026-02-18 06:27:39.578'),
(6164, 800, '989', 'วิชาคณิตศาสตร์ ข้อ20', '20', 19, 155, 'video', 'https://player.vimeo.com/video/1092395441?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.580', '2026-02-18 06:27:39.580'),
(6165, 800, '990', 'วิชาคณิตศาสตร์ ข้อ21', '21', 20, 155, 'video', 'https://player.vimeo.com/video/1092395480?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.581', '2026-02-18 06:27:39.581'),
(6166, 800, '991', 'วิชาคณิตศาสตร์ ข้อ22', '22', 21, 155, 'video', 'https://player.vimeo.com/video/1092395528?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.581', '2026-02-18 06:27:39.581'),
(6167, 800, '992', 'วิชาคณิตศาสตร์ ข้อ23', '23', 22, 155, 'video', 'https://player.vimeo.com/video/1092395575?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.582', '2026-02-18 06:27:39.582'),
(6168, 800, '993', 'วิชาคณิตศาสตร์ ข้อ24', '24', 23, 155, 'video', 'https://player.vimeo.com/video/1092395614?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.582', '2026-02-18 06:27:39.582'),
(6169, 800, '994', 'วิชาคณิตศาสตร์ ข้อ25', '25', 24, 155, 'video', 'https://player.vimeo.com/video/1092395655?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.583', '2026-02-18 06:27:39.583'),
(6170, 800, '995', 'วิชาคณิตศาสตร์ ข้อ26', '26', 25, 155, 'video', 'https://player.vimeo.com/video/1092395700?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.583', '2026-02-18 06:27:39.583'),
(6171, 800, '997', 'วิชาคณิตศาสตร์ ข้อ27', '27', 26, 155, 'video', 'https://player.vimeo.com/video/1092395750?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.584', '2026-02-18 06:27:39.584'),
(6172, 800, '998', 'วิชาคณิตศาสตร์ ข้อ28', '28', 27, 155, 'video', 'https://player.vimeo.com/video/1092395806?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.584', '2026-02-18 06:27:39.584'),
(6173, 800, '999', 'วิชาคณิตศาสตร์ ข้อ29', '29', 28, 155, 'video', 'https://player.vimeo.com/video/1092395858?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.585', '2026-02-18 06:27:39.585'),
(6174, 800, '1000', 'วิชาคณิตศาสตร์ ข้อ30', '30', 29, 155, 'video', 'https://player.vimeo.com/video/1092395904?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.585', '2026-02-18 06:27:39.585'),
(6175, 800, '1001', 'วิชาคณิตศาสตร์ ข้อ31', '31', 30, 155, 'video', 'https://player.vimeo.com/video/1092395945?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.586', '2026-02-18 06:27:39.586'),
(6176, 800, '1002', 'วิชาคณิตศาสตร์ ข้อ32', '32', 31, 155, 'video', 'https://player.vimeo.com/video/1092395984?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.586', '2026-02-18 06:27:39.586'),
(6177, 800, '1003', 'วิชาคณิตศาสตร์ ข้อ33', '33', 32, 155, 'video', 'https://player.vimeo.com/video/1092396017?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.587', '2026-02-18 06:27:39.587'),
(6178, 800, '1004', 'วิชาคณิตศาสตร์ ข้อ34', '34', 33, 155, 'video', 'https://player.vimeo.com/video/1092396067?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.587', '2026-02-18 06:27:39.587'),
(6179, 800, '1005', 'วิชาคณิตศาสตร์ ข้อ35', '35', 34, 155, 'video', 'https://player.vimeo.com/video/1092396110?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.587', '2026-02-18 06:27:39.587'),
(6180, 800, '1006', 'วิชาคณิตศาสตร์ ข้อ36', '36', 35, 155, 'video', 'https://player.vimeo.com/video/1092396163?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.588', '2026-02-18 06:27:39.588'),
(6181, 800, '1007', 'วิชาคณิตศาสตร์ ข้อ37', '37', 36, 155, 'video', 'https://player.vimeo.com/video/1092396224?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.588', '2026-02-18 06:27:39.588'),
(6182, 800, '1008', 'วิชาคณิตศาสตร์ ข้อ38', '38', 37, 155, 'video', 'https://player.vimeo.com/video/1092396269?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.589', '2026-02-18 06:27:39.589'),
(6183, 800, '1009', 'วิชาคณิตศาสตร์ ข้อ39', '39', 38, 155, 'video', 'https://player.vimeo.com/video/1092697474?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.589', '2026-02-18 06:27:39.589'),
(6184, 800, '1010', 'วิชาคณิตศาสตร์ ข้อ40', '40', 39, 155, 'video', 'https://player.vimeo.com/video/1092396364?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.589', '2026-02-18 06:27:39.589'),
(6185, 801, '1012', 'วิชาฟิสิกส์ ข้อ1', '1-2', 0, 301, 'video', 'https://player.vimeo.com/video/1092412434?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.591', '2026-02-18 06:27:39.591'),
(6186, 801, '1013', 'วิชาฟิสิกส์ ข้อ2', '2-2', 1, 380, 'video', 'https://player.vimeo.com/video/1092412452?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.591', '2026-02-18 06:27:39.591'),
(6187, 801, '1014', 'วิชาฟิสิกส์ ข้อ3', '3-2', 2, 511, 'video', 'https://player.vimeo.com/video/1092412489?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.592', '2026-02-18 06:27:39.592'),
(6188, 801, '1015', 'วิชาฟิสิกส์ ข้อ4', '4-2', 3, 304, 'video', 'https://player.vimeo.com/video/1092412525?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.592', '2026-02-18 06:27:39.592'),
(6189, 801, '1016', 'วิชาฟิสิกส์ ข้อ5', '5-2', 4, 330, 'video', 'https://player.vimeo.com/video/1092412550?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.593', '2026-02-18 06:27:39.593'),
(6190, 801, '1017', 'วิชาฟิสิกส์ ข้อ6', '6-2', 5, NULL, 'video', 'https://player.vimeo.com/video/1092412573?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.593', '2026-02-18 06:27:39.593'),
(6191, 801, '1019', 'วิชาฟิสิกส์ ข้อ7', '7-2', 6, NULL, 'video', 'https://player.vimeo.com/video/1092412602?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.594', '2026-02-18 06:27:39.594'),
(6192, 801, '1020', 'วิชาฟิสิกส์ ข้อ8', '8-2', 7, NULL, 'video', 'https://player.vimeo.com/video/1092412636?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.595', '2026-02-18 06:27:39.595'),
(6193, 801, '1021', 'วิชาฟิสิกส์ ข้อ9', '9-2', 8, NULL, 'video', 'https://player.vimeo.com/video/1092412656?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.596', '2026-02-18 06:27:39.596'),
(6194, 801, '1022', 'วิชาฟิสิกส์ ข้อ10', '10-2', 9, NULL, 'video', 'https://player.vimeo.com/video/1092412673?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.596', '2026-02-18 06:27:39.596'),
(6195, 801, '1023', 'วิชาฟิสิกส์ ข้อ11', '11-2', 10, NULL, 'video', 'https://player.vimeo.com/video/1092412694?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.596', '2026-02-18 06:27:39.596'),
(6196, 801, '1024', 'วิชาฟิสิกส์ ข้อ12', '12-2', 11, NULL, 'video', 'https://player.vimeo.com/video/1092412720?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.597', '2026-02-18 06:27:39.597'),
(6197, 801, '1025', 'วิชาฟิสิกส์ ข้อ13', '13-2', 12, NULL, 'video', 'https://player.vimeo.com/video/1092412747?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.597', '2026-02-18 06:27:39.597'),
(6198, 801, '1026', 'วิชาฟิสิกส์ ข้อ14', '14-2', 13, NULL, 'video', 'https://player.vimeo.com/video/1092412773?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.598', '2026-02-18 06:27:39.598'),
(6199, 801, '1027', 'วิชาฟิสิกส์ ข้อ15', '15-2', 14, NULL, 'video', 'https://player.vimeo.com/video/1092412806?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.598', '2026-02-18 06:27:39.598'),
(6200, 801, '1028', 'วิชาฟิสิกส์ ข้อ16', '16-2', 15, NULL, 'video', 'https://player.vimeo.com/video/1092412827?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.599', '2026-02-18 06:27:39.599'),
(6201, 801, '1029', 'วิชาฟิสิกส์ ข้อ17', '17-2', 16, NULL, 'video', 'https://player.vimeo.com/video/1092412863?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.599', '2026-02-18 06:27:39.599'),
(6202, 801, '1030', 'วิชาฟิสิกส์ ข้อ18', '18-2', 17, NULL, 'video', 'https://player.vimeo.com/video/1092412879?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.600', '2026-02-18 06:27:39.600'),
(6203, 801, '1031', 'วิชาฟิสิกส์ ข้อ19', '19-2', 18, NULL, 'video', 'https://player.vimeo.com/video/1092412903?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.600', '2026-02-18 06:27:39.600'),
(6204, 801, '1032', 'วิชาฟิสิกส์ ข้อ20', '20-2', 19, NULL, 'video', 'https://player.vimeo.com/video/1092412932?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.601', '2026-02-18 06:27:39.601'),
(6205, 802, '1034', 'วิชาเคมี ข้อ1', '1-2-3', 0, 231, 'video', 'https://player.vimeo.com/video/1092389517?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.601', '2026-02-18 06:27:39.601'),
(6206, 802, '1035', 'วิชาเคมี ข้อ2', '2-2-3', 1, 233, 'video', 'https://player.vimeo.com/video/1092389542?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.602', '2026-02-18 06:27:39.602'),
(6207, 802, '1036', 'วิชาเคมี ข้อ3', '3-2-3', 2, 306, 'video', 'https://player.vimeo.com/video/1092389572?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.602', '2026-02-18 06:27:39.602'),
(6208, 802, '1037', 'วิชาเคมี ข้อ4', '4-2-3', 3, 167, 'video', 'https://player.vimeo.com/video/1092389756?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.603', '2026-02-18 06:27:39.603'),
(6209, 802, '1038', 'วิชาเคมี ข้อ5', '5-2-3', 4, 112, 'video', 'https://player.vimeo.com/video/1092389898?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.603', '2026-02-18 06:27:39.603'),
(6210, 802, '1039', 'วิชาเคมี ข้อ6', '6-2-3', 5, 130, 'video', 'https://player.vimeo.com/video/1092389919?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.604', '2026-02-18 06:27:39.604'),
(6211, 802, '1040', 'วิชาเคมี ข้อ7', '7-2-3', 6, 525, 'video', 'https://player.vimeo.com/video/1092389960?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.604', '2026-02-18 06:27:39.604'),
(6212, 802, '1042', 'วิชาเคมี ข้อ8', '8-2-3', 7, NULL, 'video', 'https://player.vimeo.com/video/1092390046?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.605', '2026-02-18 06:27:39.605'),
(6213, 802, '1043', 'วิชาเคมี ข้อ9', '9-2-3', 8, NULL, 'video', 'https://player.vimeo.com/video/1092390094?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.605', '2026-02-18 06:27:39.605'),
(6214, 802, '1044', 'วิชาเคมี ข้อ10', '10-2-3', 9, NULL, 'video', 'https://player.vimeo.com/video/1092390126?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.605', '2026-02-18 06:27:39.605'),
(6215, 802, '1045', 'วิชาเคมี ข้อ11', '11-2-3', 10, NULL, 'video', 'https://player.vimeo.com/video/1092703614?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.606', '2026-02-18 06:27:39.606'),
(6216, 802, '1046', 'วิชาเคมี ข้อ12', '12-2-3', 11, NULL, 'video', 'https://player.vimeo.com/video/1092390183?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.606', '2026-02-18 06:27:39.606'),
(6217, 802, '1047', 'วิชาเคมี ข้อ13', '13-2-3', 12, NULL, 'video', 'https://player.vimeo.com/video/1092390218?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.607', '2026-02-18 06:27:39.607'),
(6218, 802, '1048', 'วิชาเคมี ข้อ14', '14-2-3', 13, NULL, 'video', 'https://player.vimeo.com/video/1092390253?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.608', '2026-02-18 06:27:39.608'),
(6219, 802, '1049', 'วิชาเคมี ข้อ15', '15-2-3', 14, 335, 'video', 'https://player.vimeo.com/video/1092390403?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.608', '2026-02-18 06:27:39.608'),
(6220, 802, '1050', 'วิชาเคมี ข้อ16', '16-2-3', 15, 441, 'video', 'https://player.vimeo.com/video/1092390446?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.609', '2026-02-18 06:27:39.609'),
(6221, 802, '1051', 'วิชาเคมี ข้อ17', '17-2-3', 16, NULL, 'video', 'https://player.vimeo.com/video/1092390477?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.609', '2026-02-18 06:27:39.609'),
(6222, 802, '1053', 'วิชาเคมี ข้อ18', '18-2-3', 17, NULL, 'video', 'https://player.vimeo.com/video/1092390514?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.610', '2026-02-18 06:27:39.610'),
(6223, 802, '1054', 'วิชาเคมี ข้อ19', '19-2-3', 18, NULL, 'video', 'https://player.vimeo.com/video/1092390557?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.610', '2026-02-18 06:27:39.610'),
(6224, 802, '1055', 'วิชาเคมี ข้อ20', '20-2-3', 19, NULL, 'video', 'https://player.vimeo.com/video/1092390586?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.610', '2026-02-18 06:27:39.610'),
(6225, 802, '1056', 'วิชาเคมี ข้อ21', '21-2', 20, NULL, 'video', 'https://player.vimeo.com/video/1092390624?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.611', '2026-02-18 06:27:39.611'),
(6226, 802, '1057', 'วิชาเคมี ข้อ22', '22-2', 21, NULL, 'video', 'https://player.vimeo.com/video/1092390651?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.611', '2026-02-18 06:27:39.611'),
(6227, 802, '1058', 'วิชาเคมี ข้อ23', '23-2', 22, NULL, 'video', 'https://player.vimeo.com/video/1092390669?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.612', '2026-02-18 06:27:39.612'),
(6228, 802, '1059', 'วิชาเคมี ข้อ24', '24-2', 23, NULL, 'video', 'https://player.vimeo.com/video/1092390691?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.612', '2026-02-18 06:27:39.612'),
(6229, 802, '1060', 'วิชาเคมี ข้อ25', '25-2', 24, NULL, 'video', 'https://player.vimeo.com/video/1092390718?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.612', '2026-02-18 06:27:39.612'),
(6230, 803, '1062', 'วิชาชีววิทยา ข้อ1', '1-2-3-4', 0, 155, 'video', 'https://player.vimeo.com/video/1092386912?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.614', '2026-02-18 06:27:39.614'),
(6231, 803, '1063', 'วิชาชีววิทยา ข้อ2', '2-2-3-4', 1, 166, 'video', 'https://player.vimeo.com/video/1092386947?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.614', '2026-02-18 06:27:39.614'),
(6232, 803, '1064', 'วิชาชีววิทยา ข้อ3', '3-2-3-4', 2, 133, 'video', 'https://player.vimeo.com/video/1092386987?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.615', '2026-02-18 06:27:39.615'),
(6233, 803, '1065', 'วิชาชีววิทยา ข้อ4', '4-2-3-4', 3, 76, 'video', 'https://player.vimeo.com/video/1092387010?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.615', '2026-02-18 06:27:39.615'),
(6234, 803, '1066', 'วิชาชีววิทยา ข้อ5', '5-2-3-4', 4, 113, 'video', 'https://player.vimeo.com/video/1092387037?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.616', '2026-02-18 06:27:39.616'),
(6235, 803, '1067', 'วิชาชีววิทยา ข้อ6', '6-2-3-4', 5, 85, 'video', 'https://player.vimeo.com/video/1092387058?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.616', '2026-02-18 06:27:39.616'),
(6236, 803, '1068', 'วิชาชีววิทยา ข้อ7', '7-2-3-4', 6, 132, 'video', 'https://player.vimeo.com/video/1092387092?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.617', '2026-02-18 06:27:39.617'),
(6237, 803, '1069', 'วิชาชีววิทยา ข้อ8', '8-2-3-4', 7, 104, 'video', 'https://player.vimeo.com/video/1092387114?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.617', '2026-02-18 06:27:39.617'),
(6238, 803, '1070', 'วิชาชีววิทยา ข้อ9', '9-2-3-4', 8, 104, 'video', 'https://player.vimeo.com/video/1092387158?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.618', '2026-02-18 06:27:39.618'),
(6239, 803, '1071', 'วิชาชีววิทยา ข้อ10', '10-2-3-4', 9, 166, 'video', 'https://player.vimeo.com/video/1092387443?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.618', '2026-02-18 06:27:39.618'),
(6240, 803, '1072', 'วิชาชีววิทยา ข้อ11', '11-2-3-4', 10, NULL, 'video', 'https://player.vimeo.com/video/1092387477?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.618', '2026-02-18 06:27:39.618'),
(6241, 803, '1073', 'วิชาชีววิทยา ข้อ12', '12-2-3-4', 11, NULL, 'video', 'https://player.vimeo.com/video/1092387490?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.619', '2026-02-18 06:27:39.619'),
(6242, 803, '1074', 'วิชาชีววิทยา ข้อ13', '13-2-3-4', 12, NULL, 'video', 'https://player.vimeo.com/video/1092387512?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.619', '2026-02-18 06:27:39.619'),
(6243, 803, '1075', 'วิชาชีววิทยา ข้อ14', '14-2-3-4', 13, NULL, 'video', 'https://player.vimeo.com/video/1092387547?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.620', '2026-02-18 06:27:39.620'),
(6244, 803, '1076', 'วิชาชีววิทยา ข้อ15', '15-2-3-4', 14, NULL, 'video', 'https://player.vimeo.com/video/1092387684?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.620', '2026-02-18 06:27:39.620'),
(6245, 803, '1077', 'วิชาชีววิทยา ข้อ16', '16-2-3-4', 15, NULL, 'video', 'https://player.vimeo.com/video/1092387719?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.621', '2026-02-18 06:27:39.621'),
(6246, 803, '1078', 'วิชาชีววิทยา ข้อ17', '17-2-3-4', 16, NULL, 'video', 'https://player.vimeo.com/video/1092387751?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.621', '2026-02-18 06:27:39.621'),
(6247, 803, '1079', 'วิชาชีววิทยา ข้อ18', '18-2-3-4', 17, NULL, 'video', 'https://player.vimeo.com/video/1092387852?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.622', '2026-02-18 06:27:39.622'),
(6248, 803, '1080', 'วิชาชีววิทยา ข้อ19', '19-2-3-4', 18, NULL, 'video', 'https://player.vimeo.com/video/1092387894?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.622', '2026-02-18 06:27:39.622'),
(6249, 803, '1081', 'วิชาชีววิทยา ข้อ20', '20-2-3-4', 19, NULL, 'video', 'https://player.vimeo.com/video/1092387914?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.622', '2026-02-18 06:27:39.622'),
(6250, 803, '1082', 'วิชาชีววิทยา ข้อ21', '21-2-3', 20, NULL, 'video', 'https://player.vimeo.com/video/1092387949?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.622', '2026-02-18 06:27:39.622'),
(6251, 803, '1083', 'วิชาชีววิทยา ข้อ22', '22-2-3', 21, NULL, 'video', 'https://player.vimeo.com/video/1092387980?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.623', '2026-02-18 06:27:39.623'),
(6252, 803, '1084', 'วิชาชีววิทยา ข้อ23', '23-2-3', 22, NULL, 'video', 'https://player.vimeo.com/video/1092388006?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.623', '2026-02-18 06:27:39.623'),
(6253, 803, '1085', 'วิชาชีววิทยา ข้อ24', '24-2-3', 23, NULL, 'video', 'https://player.vimeo.com/video/1092388029?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.624', '2026-02-18 06:27:39.624'),
(6254, 803, '1086', 'วิชาชีววิทยา ข้อ25', '25-2-3', 24, NULL, 'video', 'https://player.vimeo.com/video/1092388067?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.625', '2026-02-18 06:27:39.625'),
(6255, 803, '1087', 'วิชาชีววิทยา ข้อ26', '26-2', 25, NULL, 'video', 'https://player.vimeo.com/video/1092388191?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.625', '2026-02-18 06:27:39.625'),
(6256, 803, '1088', 'วิชาชีววิทยา ข้อ27', '27-2', 26, NULL, 'video', 'https://player.vimeo.com/video/1092388215?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.625', '2026-02-18 06:27:39.625'),
(6257, 803, '1089', 'วิชาชีววิทยา ข้อ28', '28-2', 27, NULL, 'video', 'https://player.vimeo.com/video/1092388236?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.626', '2026-02-18 06:27:39.626'),
(6258, 803, '1090', 'วิชาชีววิทยา ข้อ29', '29-2', 28, NULL, 'video', 'https://player.vimeo.com/video/1092388257?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.626', '2026-02-18 06:27:39.626'),
(6259, 803, '1091', 'วิชาชีววิทยา ข้อ30', '30-2', 29, NULL, 'video', 'https://player.vimeo.com/video/1092388281?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.626', '2026-02-18 06:27:39.626'),
(6260, 804, '1093', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ1', 'lesson-1', 0, 123, 'video', 'https://player.vimeo.com/video/1092391714?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.627', '2026-02-18 06:27:39.627'),
(6261, 804, '1094', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ2', '2-2-3-4-5', 1, 172, 'video', 'https://player.vimeo.com/video/1092391829?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.633', '2026-02-18 06:27:39.633'),
(6262, 804, '1095', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ3', '3-2-3-4-5', 2, 138, 'video', 'https://player.vimeo.com/video/1092391874?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.634', '2026-02-18 06:27:39.634'),
(6263, 804, '1096', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ4', '4-2-3-4-5', 3, 288, 'video', 'https://player.vimeo.com/video/1092391911?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.634', '2026-02-18 06:27:39.634'),
(6264, 804, '1097', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ5', '5-2-3-4-5', 4, 272, 'video', 'https://player.vimeo.com/video/1092391979?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.635', '2026-02-18 06:27:39.635'),
(6265, 804, '1098', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ6', '6-2-3-4-5', 5, 96, 'video', 'https://player.vimeo.com/video/1092392014?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.636', '2026-02-18 06:27:39.636'),
(6266, 804, '1099', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ7', '7-2-3-4-5', 6, 109, 'video', 'https://player.vimeo.com/video/1092392048?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.636', '2026-02-18 06:27:39.636'),
(6267, 804, '1100', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ8', '8-2-3-4-5', 7, 204, 'video', 'https://player.vimeo.com/video/1092392075?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.636', '2026-02-18 06:27:39.636'),
(6268, 804, '1101', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ9', '9-2-3-4-5', 8, 206, 'video', 'https://player.vimeo.com/video/1092392123?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.637', '2026-02-18 06:27:39.637'),
(6269, 804, '1102', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ10', '10-2-3-4-5', 9, 101, 'video', 'https://player.vimeo.com/video/1092392146?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.637', '2026-02-18 06:27:39.637'),
(6270, 804, '1103', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ11', '11-2-3-4-5', 10, 231, 'video', 'https://player.vimeo.com/video/1092392186?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.637', '2026-02-18 06:27:39.637'),
(6271, 804, '1104', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ12', '12-2-3-4-5', 11, 217, 'video', 'https://player.vimeo.com/video/1092392210?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.638', '2026-02-18 06:27:39.638'),
(6272, 804, '1105', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ13', '13-2-3-4-5', 12, 254, 'video', 'https://player.vimeo.com/video/1092392262?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.638', '2026-02-18 06:27:39.638'),
(6273, 804, '1106', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ14', '14-2-3-4-5', 13, 106, 'video', 'https://player.vimeo.com/video/1092392308?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.639', '2026-02-18 06:27:39.639'),
(6274, 804, '1107', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ15', '15-2-3-4-5', 14, 176, 'video', 'https://player.vimeo.com/video/1092392334?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.640', '2026-02-18 06:27:39.640'),
(6275, 804, '1108', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ16', '16-2-3-4-5', 15, 123, 'video', 'https://player.vimeo.com/video/1092392361?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.640', '2026-02-18 06:27:39.640'),
(6276, 804, '1109', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ17', '17-2-3-4-5', 16, 321, 'video', 'https://player.vimeo.com/video/1092392399?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.641', '2026-02-18 06:27:39.641'),
(6277, 804, '1110', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ18', '18-2-3-4-5', 17, 246, 'video', 'https://player.vimeo.com/video/1092392435?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.641', '2026-02-18 06:27:39.641'),
(6278, 804, '1111', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ19', '19-2-3-4-5', 18, 90, 'video', 'https://player.vimeo.com/video/1092392455?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.642', '2026-02-18 06:27:39.642'),
(6279, 804, '1112', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ20', '20-2-3-4-5', 19, 198, 'video', 'https://player.vimeo.com/video/1092392480?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.642', '2026-02-18 06:27:39.642'),
(6280, 804, '1113', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ21', '21-2-3-4', 20, 164, 'video', 'https://player.vimeo.com/video/1092392503?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.642', '2026-02-18 06:27:39.642'),
(6281, 804, '1114', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ22', '22-2-3-4', 21, 139, 'video', 'https://player.vimeo.com/video/1092392556?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.643', '2026-02-18 06:27:39.643'),
(6282, 804, '1115', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ23', '23-2-3-4', 22, 278, 'video', 'https://player.vimeo.com/video/1092392585?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.643', '2026-02-18 06:27:39.643'),
(6283, 804, '1116', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ24', '24-2-3-4', 23, 204, 'video', 'https://player.vimeo.com/video/1092392606?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.643', '2026-02-18 06:27:39.643'),
(6284, 804, '1117', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ25', '25-2-3-4', 24, 179, 'video', 'https://player.vimeo.com/video/1092392624?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.644', '2026-02-18 06:27:39.644'),
(6285, 804, '1118', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ26', '26-2-3', 25, 92, 'video', 'https://player.vimeo.com/video/1092392656?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.644', '2026-02-18 06:27:39.644'),
(6286, 804, '1119', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ27', '27-2-3', 26, 122, 'video', 'https://player.vimeo.com/video/1092392689?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.645', '2026-02-18 06:27:39.645'),
(6287, 804, '1120', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ28', '28-2-3', 27, 162, 'video', 'https://player.vimeo.com/video/1092392712?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.645', '2026-02-18 06:27:39.645'),
(6288, 804, '1121', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ29', '29-2-3', 28, 305, 'video', 'https://player.vimeo.com/video/1092392800?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.645', '2026-02-18 06:27:39.645'),
(6289, 804, '1122', 'วิชาวิทยาศาสตร์และเทคโนโลยี ข้อ30', '30-2-3', 29, 78, 'video', 'https://player.vimeo.com/video/1092392819?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.646', '2026-02-18 06:27:39.646'),
(6290, 805, '1124', 'วิชาภาษาอังกฤษ ข้อ1', '1-2-3-4-5', 0, 149, 'video', 'https://player.vimeo.com/video/1092397735?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.646', '2026-02-18 06:27:39.646'),
(6291, 805, '1125', 'วิชาภาษาอังกฤษ ข้อ2', '2-2-3-4-5-6', 1, 114, 'video', 'https://player.vimeo.com/video/1092397786?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.647', '2026-02-18 06:27:39.647'),
(6292, 805, '1126', 'วิชาภาษาอังกฤษ ข้อ3', '3-2-3-4-5-6', 2, 66, 'video', 'https://player.vimeo.com/video/1092397835?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.647', '2026-02-18 06:27:39.647'),
(6293, 805, '1127', 'วิชาภาษาอังกฤษ ข้อ4', '4-2-3-4-5-6', 3, 93, 'video', 'https://player.vimeo.com/video/1092397870?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.647', '2026-02-18 06:27:39.647'),
(6294, 805, '1128', 'วิชาภาษาอังกฤษ ข้อ5', '5-2-3-4-5-6', 4, 96, 'video', 'https://player.vimeo.com/video/1092397921?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.648', '2026-02-18 06:27:39.648'),
(6295, 805, '1129', 'วิชาภาษาอังกฤษ ข้อ6', '6-2-3-4-5-6', 5, 103, 'video', 'https://player.vimeo.com/video/1092397955?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.648', '2026-02-18 06:27:39.648'),
(6296, 805, '1130', 'วิชาภาษาอังกฤษ ข้อ7', '7-2-3-4-5-6', 6, 79, 'video', 'https://player.vimeo.com/video/1092397992?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.648', '2026-02-18 06:27:39.648'),
(6297, 805, '1131', 'วิชาภาษาอังกฤษ ข้อ8', '8-2-3-4-5-6', 7, 117, 'video', 'https://player.vimeo.com/video/1092398023?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.649', '2026-02-18 06:27:39.649'),
(6298, 805, '1132', 'วิชาภาษาอังกฤษ ข้อ9', '9-2-3-4-5-6', 8, 119, 'video', 'https://player.vimeo.com/video/1092398063?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.649', '2026-02-18 06:27:39.649'),
(6299, 805, '1133', 'วิชาภาษาอังกฤษ ข้อ10', '10-2-3-4-5-6', 9, 94, 'video', 'https://player.vimeo.com/video/1092398095?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.649', '2026-02-18 06:27:39.649'),
(6300, 805, '1134', 'วิชาภาษาอังกฤษ ข้อ11', '11-2-3-4-5-6', 10, 68, 'video', 'https://player.vimeo.com/video/1092398124?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.649', '2026-02-18 06:27:39.649'),
(6301, 805, '1135', 'วิชาภาษาอังกฤษ ข้อ12', '12-2-3-4-5-6', 11, 78, 'video', 'https://player.vimeo.com/video/1092398162?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.650', '2026-02-18 06:27:39.650'),
(6302, 805, '1136', 'วิชาภาษาอังกฤษ ข้อ13', '13-2-3-4-5-6', 12, 149, 'video', 'https://player.vimeo.com/video/1092398207?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.650', '2026-02-18 06:27:39.650'),
(6303, 805, '1137', 'วิชาภาษาอังกฤษ ข้อ14', '14-2-3-4-5-6', 13, 114, 'video', 'https://player.vimeo.com/video/1092398290?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.650', '2026-02-18 06:27:39.650'),
(6304, 805, '1138', 'วิชาภาษาอังกฤษ ข้อ15', '15-2-3-4-5-6', 14, 77, 'video', 'https://player.vimeo.com/video/1092398324?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.651', '2026-02-18 06:27:39.651'),
(6305, 805, '1139', 'วิชาภาษาอังกฤษ ข้อ16', '16-2-3-4-5-6', 15, 92, 'video', 'https://player.vimeo.com/video/1092398359?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.651', '2026-02-18 06:27:39.651'),
(6306, 805, '1140', 'วิชาภาษาอังกฤษ ข้อ17', '17-2-3-4-5-6', 16, 122, 'video', 'https://player.vimeo.com/video/1092398411?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.652', '2026-02-18 06:27:39.652'),
(6307, 805, '1141', 'วิชาภาษาอังกฤษ ข้อ18', '18-2-3-4-5-6', 17, 149, 'video', 'https://player.vimeo.com/video/1092398444?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.652', '2026-02-18 06:27:39.652'),
(6308, 805, '1142', 'วิชาภาษาอังกฤษ ข้อ19', '19-2-3-4-5-6', 18, 61, 'video', 'https://player.vimeo.com/video/1092398494?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.652', '2026-02-18 06:27:39.652'),
(6309, 805, '1143', 'วิชาภาษาอังกฤษ ข้อ20', '20-2-3-4-5-6', 19, 134, 'video', 'https://player.vimeo.com/video/1092398537?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.653', '2026-02-18 06:27:39.653'),
(6310, 805, '1144', 'วิชาภาษาอังกฤษ ข้อ21', '21-2-3-4-5', 20, 98, 'video', 'https://player.vimeo.com/video/1092398570?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.653', '2026-02-18 06:27:39.653'),
(6311, 805, '1145', 'วิชาภาษาอังกฤษ ข้อ22', '22-2-3-4-5', 21, 110, 'video', 'https://player.vimeo.com/video/1092398618?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.653', '2026-02-18 06:27:39.653'),
(6312, 805, '1147', 'วิชาภาษาอังกฤษ ข้อ23', '23-2-3-4-5', 22, 53, 'video', 'https://player.vimeo.com/video/1092398666?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.654', '2026-02-18 06:27:39.654'),
(6313, 805, '1148', 'วิชาภาษาอังกฤษ ข้อ24', '24-2-3-4-5', 23, 113, 'video', 'https://player.vimeo.com/video/1092398718?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.654', '2026-02-18 06:27:39.654'),
(6314, 805, '1149', 'วิชาภาษาอังกฤษ ข้อ25', '25-2-3-4-5', 24, 115, 'video', 'https://player.vimeo.com/video/1092398768?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.654', '2026-02-18 06:27:39.654');
INSERT INTO `lessons` (`id`, `module_id`, `public_id`, `title`, `slug`, `lesson_order`, `duration_seconds`, `type`, `video_url`, `video_provider`, `content_html`, `is_active`, `created_at`, `updated_at`) VALUES
(6315, 805, '1150', 'วิชาภาษาอังกฤษ ข้อ26', '26-2-3-4', 25, 120, 'video', 'https://player.vimeo.com/video/1092398811?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.655', '2026-02-18 06:27:39.655'),
(6316, 805, '1151', 'วิชาภาษาอังกฤษ ข้อ27', '27-2-3-4', 26, 89, 'video', 'https://player.vimeo.com/video/1092398859?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.655', '2026-02-18 06:27:39.655'),
(6317, 805, '1152', 'วิชาภาษาอังกฤษ ข้อ28', '28-2-3-4', 27, 74, 'video', 'https://player.vimeo.com/video/1092398911?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.656', '2026-02-18 06:27:39.656'),
(6318, 805, '1153', 'วิชาภาษาอังกฤษ ข้อ29', '29-2-3-4', 28, 128, 'video', 'https://player.vimeo.com/video/1092398967?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.656', '2026-02-18 06:27:39.656'),
(6319, 805, '1154', 'วิชาภาษาอังกฤษ ข้อ30', '30-2-3-4', 29, NULL, 'video', 'https://player.vimeo.com/video/1092399019?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.656', '2026-02-18 06:27:39.656'),
(6320, 805, '1155', 'วิชาภาษาอังกฤษ ข้อ31', '31-2', 30, 102, 'video', 'https://player.vimeo.com/video/1092399056?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.656', '2026-02-18 06:27:39.656'),
(6321, 805, '1156', 'วิชาภาษาอังกฤษ ข้อ32', '32-2', 31, 89, 'video', 'https://player.vimeo.com/video/1092399101?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.657', '2026-02-18 06:27:39.657'),
(6322, 805, '1157', 'วิชาภาษาอังกฤษ ข้อ33', '33-2', 32, 133, 'video', 'https://player.vimeo.com/video/1092399148?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.657', '2026-02-18 06:27:39.657'),
(6323, 805, '1158', 'วิชาภาษาอังกฤษ ข้อ34', '34-2', 33, 64, 'video', 'https://player.vimeo.com/video/1092399198?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.657', '2026-02-18 06:27:39.657'),
(6324, 805, '1159', 'วิชาภาษาอังกฤษ ข้อ35', '35-2', 34, NULL, 'video', 'https://player.vimeo.com/video/1092399255?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.657', '2026-02-18 06:27:39.657'),
(6325, 805, '1160', 'วิชาภาษาอังกฤษ ข้อ36', '36-2', 35, NULL, 'video', 'https://player.vimeo.com/video/1092399308?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.658', '2026-02-18 06:27:39.658'),
(6326, 805, '1161', 'วิชาภาษาอังกฤษ ข้อ37', '37-2', 36, NULL, 'video', 'https://player.vimeo.com/video/1092399340?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.658', '2026-02-18 06:27:39.658'),
(6327, 805, '1162', 'วิชาภาษาอังกฤษ ข้อ38', '38-2', 37, NULL, 'video', 'https://player.vimeo.com/video/1092399376?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.658', '2026-02-18 06:27:39.658'),
(6328, 805, '1163', 'วิชาภาษาอังกฤษ ข้อ39', '39-2', 38, NULL, 'video', 'https://player.vimeo.com/video/1092399428?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.659', '2026-02-18 06:27:39.659'),
(6329, 805, '1164', 'วิชาภาษาอังกฤษ ข้อ40', '40-2', 39, NULL, 'video', 'https://player.vimeo.com/video/1092399522?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.659', '2026-02-18 06:27:39.659'),
(6330, 805, '1165', 'วิชาภาษาอังกฤษ ข้อ41', '41', 40, NULL, 'video', 'https://player.vimeo.com/video/1092399557?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.659', '2026-02-18 06:27:39.659'),
(6331, 805, '1166', 'วิชาภาษาอังกฤษ ข้อ42', '42', 41, NULL, 'video', 'https://player.vimeo.com/video/1092399588?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.660', '2026-02-18 06:27:39.660'),
(6332, 805, '1167', 'วิชาภาษาอังกฤษ ข้อ43', '43', 42, NULL, 'video', 'https://player.vimeo.com/video/1092399616?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.660', '2026-02-18 06:27:39.660'),
(6333, 805, '1168', 'วิชาภาษาอังกฤษ ข้อ44', '44', 43, NULL, 'video', 'https://player.vimeo.com/video/1092399640?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.660', '2026-02-18 06:27:39.660'),
(6334, 805, '1169', 'วิชาภาษาอังกฤษ ข้อ45', '45', 44, NULL, 'video', 'https://player.vimeo.com/video/1092399665?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.661', '2026-02-18 06:27:39.661'),
(6335, 805, '1170', 'วิชาภาษาอังกฤษ ข้อ46', '46', 45, NULL, 'video', 'https://player.vimeo.com/video/1092399708?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.661', '2026-02-18 06:27:39.661'),
(6336, 805, '1171', 'วิชาภาษาอังกฤษ ข้อ47', '47', 46, NULL, 'video', 'https://player.vimeo.com/video/1092399732?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.661', '2026-02-18 06:27:39.661'),
(6337, 805, '1172', 'วิชาภาษาอังกฤษ ข้อ48', '48', 47, NULL, 'video', 'https://player.vimeo.com/video/1092399762?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.662', '2026-02-18 06:27:39.662'),
(6338, 805, '1173', 'วิชาภาษาอังกฤษ ข้อ49', '49', 48, NULL, 'video', 'https://player.vimeo.com/video/1092399792?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.662', '2026-02-18 06:27:39.662'),
(6339, 805, '1174', 'วิชาภาษาอังกฤษ ข้อ50', '50', 49, 81, 'video', 'https://player.vimeo.com/video/1092399846?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.663', '2026-02-18 06:27:39.663'),
(6340, 806, '1176', 'วิชาภาษาไทย ข้อ1', '1-2-3-4-5-6', 0, 437, 'video', 'https://player.vimeo.com/video/1092400035?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.663', '2026-02-18 06:27:39.663'),
(6341, 806, '1177', 'วิชาภาษาไทย ข้อ2', '2-2-3-4-5-6-7', 1, 84, 'video', 'https://player.vimeo.com/video/1092400089?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.664', '2026-02-18 06:27:39.664'),
(6342, 806, '1178', 'วิชาภาษาไทย ข้อ3', '3-2-3-4-5-6-7', 2, 296, 'video', 'https://player.vimeo.com/video/1092400117?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.664', '2026-02-18 06:27:39.664'),
(6343, 806, '1179', 'วิชาภาษาไทย ข้อ4', '4-2-3-4-5-6-7', 3, 148, 'video', 'https://player.vimeo.com/video/1092400154?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.664', '2026-02-18 06:27:39.664'),
(6344, 806, '1182', 'วิชาภาษาไทย ข้อ5', '5-2-3-4-5-6-7', 4, 56, 'video', 'https://player.vimeo.com/video/1092400185?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.665', '2026-02-18 06:27:39.665'),
(6345, 806, '1183', 'วิชาภาษาไทย ข้อ6', '6-2-3-4-5-6-7', 5, 249, 'video', 'https://player.vimeo.com/video/1092400206?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.665', '2026-02-18 06:27:39.665'),
(6346, 806, '1184', 'วิชาภาษาไทย ข้อ7', '7-2-3-4-5-6-7', 6, 140, 'video', 'https://player.vimeo.com/video/1092400249?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.665', '2026-02-18 06:27:39.665'),
(6347, 806, '1185', 'วิชาภาษาไทย ข้อ8', '8-2-3-4-5-6-7', 7, 157, 'video', 'https://player.vimeo.com/video/1092400266?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.666', '2026-02-18 06:27:39.666'),
(6348, 806, '1186', 'วิชาภาษาไทย ข้อ9', '9-2-3-4-5-6-7', 8, 58, 'video', 'https://player.vimeo.com/video/1092400296?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.667', '2026-02-18 06:27:39.667'),
(6349, 806, '1187', 'วิชาภาษาไทย ข้อ10', '10-2-3-4-5-6-7', 9, 152, 'video', 'https://player.vimeo.com/video/1092400328?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.667', '2026-02-18 06:27:39.667'),
(6350, 806, '1188', 'วิชาภาษาไทย ข้อ11', '11-2-3-4-5-6-7', 10, 58, 'video', 'https://player.vimeo.com/video/1092400371?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.667', '2026-02-18 06:27:39.667'),
(6351, 806, '1189', 'วิชาภาษาไทย ข้อ12', '12-2-3-4-5-6-7', 11, 131, 'video', 'https://player.vimeo.com/video/1092400392?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.668', '2026-02-18 06:27:39.668'),
(6352, 806, '1190', 'วิชาภาษาไทย ข้อ13', '13-2-3-4-5-6-7', 12, 76, 'video', 'https://player.vimeo.com/video/1092400419?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.668', '2026-02-18 06:27:39.668'),
(6353, 806, '1191', 'วิชาภาษาไทย ข้อ14', '14-2-3-4-5-6-7', 13, 61, 'video', 'https://player.vimeo.com/video/1092400453?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.669', '2026-02-18 06:27:39.669'),
(6354, 806, '1192', 'วิชาภาษาไทย ข้อ15', '15-2-3-4-5-6-7', 14, 234, 'video', 'https://player.vimeo.com/video/1092400469?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.669', '2026-02-18 06:27:39.669'),
(6355, 806, '1193', 'วิชาภาษาไทย ข้อ16', '16-2-3-4-5-6-7', 15, 120, 'video', 'https://player.vimeo.com/video/1092400524?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.669', '2026-02-18 06:27:39.669'),
(6356, 806, '1194', 'วิชาภาษาไทย ข้อ17', '17-2-3-4-5-6-7', 16, 78, 'video', 'https://player.vimeo.com/video/1092400554?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.669', '2026-02-18 06:27:39.669'),
(6357, 806, '1195', 'วิชาภาษาไทย ข้อ18', '18-2-3-4-5-6-7', 17, 351, 'video', 'https://player.vimeo.com/video/1092400584?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.670', '2026-02-18 06:27:39.670'),
(6358, 806, '1196', 'วิชาภาษาไทย ข้อ19', '19-2-3-4-5-6-7', 18, 55, 'video', 'https://player.vimeo.com/video/1092400621?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.670', '2026-02-18 06:27:39.670'),
(6359, 806, '1197', 'วิชาภาษาไทย ข้อ20', '20-2-3-4-5-6-7', 19, 56, 'video', 'https://player.vimeo.com/video/1092400662?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.671', '2026-02-18 06:27:39.671'),
(6360, 806, '1198', 'วิชาภาษาไทย ข้อ21', '21-2-3-4-5-6', 20, 33, 'video', 'https://player.vimeo.com/video/1092400696?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.671', '2026-02-18 06:27:39.671'),
(6361, 806, '1199', 'วิชาภาษาไทย ข้อ22', '22-2-3-4-5-6', 21, 28, 'video', 'https://player.vimeo.com/video/1092400730?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.672', '2026-02-18 06:27:39.672'),
(6362, 806, '1200', 'วิชาภาษาไทย ข้อ23', '23-2-3-4-5-6', 22, 63, 'video', 'https://player.vimeo.com/video/1092400760?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.672', '2026-02-18 06:27:39.672'),
(6363, 806, '1201', 'วิชาภาษาไทย ข้อ24', '24-2-3-4-5-6', 23, 160, 'video', 'https://player.vimeo.com/video/1092400789?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.672', '2026-02-18 06:27:39.672'),
(6364, 806, '1202', 'วิชาภาษาไทย ข้อ25', '25-2-3-4-5-6', 24, 23, 'video', 'https://player.vimeo.com/video/1092400842?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.672', '2026-02-18 06:27:39.672'),
(6365, 806, '1203', 'วิชาภาษาไทย ข้อ26', '26-2-3-4-5', 25, 80, 'video', 'https://player.vimeo.com/video/1092400857?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.673', '2026-02-18 06:27:39.673'),
(6366, 806, '1204', 'วิชาภาษาไทย ข้อ27', '27-2-3-4-5', 26, 200, 'video', 'https://player.vimeo.com/video/1092400921?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.673', '2026-02-18 06:27:39.673'),
(6367, 806, '1205', 'วิชาภาษาไทย ข้อ28', '28-2-3-4-5', 27, 12, 'video', 'https://player.vimeo.com/video/1092400945?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.673', '2026-02-18 06:27:39.673'),
(6368, 806, '1206', 'วิชาภาษาไทย ข้อ29', '29-2-3-4-5', 28, 47, 'video', 'https://player.vimeo.com/video/1092400968?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.674', '2026-02-18 06:27:39.674'),
(6369, 806, '1207', 'วิชาภาษาไทย ข้อ30', '30-2-3-4-5', 29, 33, 'video', 'https://player.vimeo.com/video/1092400996?share=copy', 'unknown', NULL, 1, '2026-02-18 06:27:39.674', '2026-02-18 06:27:39.674'),
(6370, 807, '17900', 'link สำหรับการเข้าชมแนวข้อสอบ Netsat', 'link', 0, NULL, 'video', NULL, NULL, NULL, 1, '2026-02-18 06:27:39.675', '2026-02-18 06:27:39.675'),
(6413, 813, '418', 'วิชาคณิคศาสตร์ EP.1 ข้อ 1-5', 'ep-1-1-5', 0, 2118, 'video', 'https://player.vimeo.com/video/1132727843', 'unknown', NULL, 1, '2026-02-19 09:37:15.179', '2026-02-19 09:37:15.179'),
(6414, 813, '419', 'วิชาคณิคศาสตร์ EP.2 ข้อ 6-10', 'ep-2-6-10', 1, 2392, 'video', 'https://player.vimeo.com/video/1132727872', 'unknown', NULL, 1, '2026-02-19 09:37:15.180', '2026-02-19 09:37:15.180'),
(6415, 813, '420', 'วิชาคณิคศาสตร์ EP.3 ข้อ 11-15', 'ep-3-11-15', 2, 2356, 'video', 'https://player.vimeo.com/video/1132727903', 'unknown', NULL, 1, '2026-02-19 09:37:15.181', '2026-02-19 09:37:15.181'),
(6416, 813, '421', 'วิชาคณิคศาสตร์ EP.4 ข้อ 16-20', 'ep-4-16-20', 3, 1816, 'video', 'https://player.vimeo.com/video/1162455821', 'unknown', NULL, 1, '2026-02-19 09:37:15.182', '2026-02-19 09:37:15.182'),
(6417, 813, '422', 'วิชาคณิคศาสตร์ EP.5 ข้อ 21-25', 'ep-5-21-25', 4, 1847, 'video', 'https://player.vimeo.com/video/1132727945', 'unknown', NULL, 1, '2026-02-19 09:37:15.182', '2026-02-19 09:37:15.182'),
(6418, 813, '423', 'วิชาคณิคศาสตร์ EP.6 ข้อ 26-30', 'ep-6-26-30', 5, 2502, 'video', 'https://player.vimeo.com/video/1132727962', 'unknown', NULL, 1, '2026-02-19 09:37:15.183', '2026-02-19 09:37:15.183'),
(6419, 814, '425', 'ฟิสิกส์ EP.1 ข้อที่ 1-10', 'ep-1-1-10', 0, 3620, 'video', 'https://player.vimeo.com/video/1132732869', 'unknown', NULL, 1, '2026-02-19 09:37:15.184', '2026-02-19 09:37:15.184'),
(6420, 814, '426', 'ฟิสิกส์ EP.2 ข้อที่ 11-20', 'ep-2-11-20', 1, 3690, 'video', 'https://player.vimeo.com/video/1132732891?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-19 09:37:15.185', '2026-02-19 09:37:15.185'),
(6421, 814, '427', 'ฟิสิกส์ EP.3 ข้อที่ 21-30', 'ep-3-21-30', 2, 2257, 'video', 'https://player.vimeo.com/video/1132732919', 'unknown', NULL, 1, '2026-02-19 09:37:15.185', '2026-02-19 09:37:15.185'),
(6422, 815, '429', 'เคมี EP.1 ข้อที่ 1-10', 'ep-1-1-10-2', 0, 3194, 'video', 'https://player.vimeo.com/video/1132730953', 'unknown', NULL, 1, '2026-02-19 09:37:15.186', '2026-02-19 09:37:15.186'),
(6423, 815, '430', 'เคมี EP.2 ข้อ 11 - 20', 'ep-2-11-20-2', 1, 2472, 'video', 'https://player.vimeo.com/video/1132731092', 'unknown', NULL, 1, '2026-02-19 09:37:15.187', '2026-02-19 09:37:15.187'),
(6424, 815, '431', 'เคมี EP.3 ข้อ 21-30', 'ep-3-21-30-2', 2, 2260, 'video', 'https://player.vimeo.com/video/1132731142', 'unknown', NULL, 1, '2026-02-19 09:37:15.188', '2026-02-19 09:37:15.188'),
(6425, 815, '432', 'เคมี EP.4 ข้อ 31-35', 'ep-4-31-35', 3, 2935, 'video', 'https://player.vimeo.com/video/1132731162', 'unknown', NULL, 1, '2026-02-19 09:37:15.188', '2026-02-19 09:37:15.188'),
(6426, 816, '434', 'ชีววิทยา EP.1 ข้อที่ 1-10', 'ep-1-1-10-2-3', 0, 2676, 'video', 'https://player.vimeo.com/video/1132731892', 'unknown', NULL, 1, '2026-02-19 09:37:15.189', '2026-02-19 09:37:15.189'),
(6427, 816, '435', 'ชีววิทยา EP.2 ข้อที่ 11-20', 'ep-2-11-20-2-3', 1, 2627, 'video', 'https://player.vimeo.com/video/1132732061', 'unknown', NULL, 1, '2026-02-19 09:37:15.189', '2026-02-19 09:37:15.189'),
(6428, 816, '436', 'ชีววิทยา EP.3 ข้อที่ 21-30', 'ep-3-21-30-2-3', 2, 2136, 'video', 'https://player.vimeo.com/video/1132732196', 'unknown', NULL, 1, '2026-02-19 09:37:15.191', '2026-02-19 09:37:15.191'),
(6429, 816, '437', 'ชีววิทยา EP.4 ข้อที่ 31-40', 'ep-4-31-40', 3, 2719, 'video', 'https://player.vimeo.com/video/1132732250', 'unknown', NULL, 1, '2026-02-19 09:37:15.192', '2026-02-19 09:37:15.192'),
(6430, 817, '439', 'ภาษาไทย EP.1 ข้อ 1-10', 'ep-1-1-10-2-3-4', 0, 2356, 'video', 'https://player.vimeo.com/video/1132731685', 'unknown', NULL, 1, '2026-02-19 09:37:15.193', '2026-02-19 09:37:15.193'),
(6431, 817, '440', 'ภาษาไทย EP.2 ข้อ 11-20', 'ep-2-11-20-2-3-4', 1, 1730, 'video', 'https://player.vimeo.com/video/1132731662', 'unknown', NULL, 1, '2026-02-19 09:37:15.193', '2026-02-19 09:37:15.193'),
(6432, 817, '441', 'ภาษาไทย EP.3 ข้อ 21-30', 'ep-3-21-30-2-3-4', 2, 1877, 'video', 'https://player.vimeo.com/video/1132731640', 'unknown', NULL, 1, '2026-02-19 09:37:15.194', '2026-02-19 09:37:15.194'),
(6433, 817, '442', 'ภาษาไทย EP.4 ข้อ 31-40', 'ep-4-31-40-2', 3, 1948, 'video', 'https://player.vimeo.com/video/1132732657', 'unknown', NULL, 1, '2026-02-19 09:37:15.194', '2026-02-19 09:37:15.194'),
(6434, 817, '4694', 'ภาษาไทย EP.5 ข้อ 41-50', 'ep-5-41-50', 4, 1766, 'video', 'https://player.vimeo.com/video/1132732622', 'unknown', NULL, 1, '2026-02-19 09:37:15.195', '2026-02-19 09:37:15.195'),
(6435, 818, '444', 'ภาษาอังกฤษ EP.1 ข้อ 1-20', 'ep-1-1-20', 0, 1623, 'video', 'https://player.vimeo.com/video/1132733924', 'unknown', NULL, 1, '2026-02-19 09:37:15.196', '2026-02-19 09:37:15.196'),
(6436, 818, '445', 'ภาษาอังกฤษ EP.2 ข้อ 21-32', 'ep-2-21-32', 1, 2581, 'video', 'https://player.vimeo.com/video/1132734177', 'unknown', NULL, 1, '2026-02-19 09:37:15.196', '2026-02-19 09:37:15.196'),
(6437, 818, '446', 'ภาษาอังกฤษ EP.3 ข้อ 33-44', 'ep-3-33-44', 2, 1860, 'video', 'https://player.vimeo.com/video/1132734116', 'unknown', NULL, 1, '2026-02-19 09:37:15.197', '2026-02-19 09:37:15.197'),
(6438, 818, '447', 'ภาษาอังกฤษ EP.4 ข้อ 45-52', 'ep-4-45-52', 3, 1601, 'video', 'https://player.vimeo.com/video/1132734073', 'unknown', NULL, 1, '2026-02-19 09:37:15.198', '2026-02-19 09:37:15.198'),
(6439, 818, '448', 'ภาษาอังกฤษ EP.5 ข้อ 53-60', 'ep-5-53-60', 4, 1345, 'video', 'https://player.vimeo.com/video/1132734025', 'unknown', NULL, 1, '2026-02-19 09:37:15.198', '2026-02-19 09:37:15.198'),
(6440, 818, '449', 'ภาษาอังกฤษ EP.6 ข้อ 61-75', 'ep-6-61-75', 5, 1889, 'video', 'https://player.vimeo.com/video/1132733990', 'unknown', NULL, 1, '2026-02-19 09:37:15.199', '2026-02-19 09:37:15.199'),
(6441, 818, '4710', 'ภาษาอังกฤษ EP.7 ข้อ 76-80', 'ep-7-76-80', 6, 1008, 'video', 'https://player.vimeo.com/video/1132733963', 'unknown', NULL, 1, '2026-02-19 09:37:15.199', '2026-02-19 09:37:15.199'),
(6442, 819, '451', 'สังคมศึกษา EP.1 ข้อ 1-10', 'ep-1-1-10-2-3-4-5', 0, 1693, 'video', 'https://player.vimeo.com/video/1132730085', 'unknown', NULL, 1, '2026-02-19 09:37:15.200', '2026-02-19 09:37:15.200'),
(6443, 819, '452', 'สังคมศึกษา EP.2 ข้อ 11-20', 'ep-2-11-20-2-3-4-5', 1, 1505, 'video', 'https://player.vimeo.com/video/1132730233', 'unknown', NULL, 1, '2026-02-19 09:37:15.201', '2026-02-19 09:37:15.201'),
(6444, 819, '453', 'สังคมศึกษา EP.3 ข้อ 21-35', 'ep-3-21-35', 2, 2508, 'video', 'https://player.vimeo.com/video/1132730101', 'unknown', NULL, 1, '2026-02-19 09:37:15.201', '2026-02-19 09:37:15.201'),
(6445, 819, '454', 'สังคมศึกษา EP.4 ข้อ 36-50', 'ep-4-36-50', 3, 1635, 'video', 'https://player.vimeo.com/video/1132730179', 'unknown', NULL, 1, '2026-02-19 09:37:15.202', '2026-02-19 09:37:15.202'),
(6513, 827, '339', 'บทนำ TCAS เกณฑ์ใหม่', 'tcas', 0, 1065, 'video', 'https://player.vimeo.com/video/1078611876', 'unknown', NULL, 1, '2026-02-19 09:50:52.762', '2026-02-19 09:50:52.762'),
(6514, 827, '335', 'ระบบจำนวนจริง', 'lesson-2', 1, 2341, 'video', 'https://player.vimeo.com/video/1078603830', 'unknown', NULL, 1, '2026-02-19 09:50:52.763', '2026-02-19 09:50:52.763'),
(6515, 827, '336', 'ตรรกศาสตร์', 'lesson-3', 2, 3515, 'video', 'https://player.vimeo.com/video/1078604683', 'unknown', NULL, 1, '2026-02-19 09:50:52.763', '2026-02-19 09:50:52.763'),
(6516, 827, '337', 'ฟังก์ชันเอกซ์โปเนนเชียลและลอการิทึม', 'lesson-4', 3, 1878, 'video', 'https://player.vimeo.com/video/1078610630', 'unknown', NULL, 1, '2026-02-19 09:50:52.764', '2026-02-19 09:50:52.764'),
(6517, 827, '338', 'เมทริกซ์', 'lesson-5', 4, 2467, 'video', 'https://player.vimeo.com/video/1078610996', 'unknown', NULL, 1, '2026-02-19 09:50:52.764', '2026-02-19 09:50:52.764'),
(6518, 827, '340', 'ความน่าจะเป็น', 'lesson-6', 5, 2462, 'video', 'https://player.vimeo.com/video/1078612005', 'unknown', NULL, 1, '2026-02-19 09:50:52.764', '2026-02-19 09:50:52.764'),
(6519, 827, '341', 'เซต', 'lesson-7', 6, 2135, 'video', 'https://player.vimeo.com/video/1078612232', 'unknown', NULL, 1, '2026-02-19 09:50:52.765', '2026-02-19 09:50:52.765'),
(6520, 827, '342', 'ความสัมพันธ์และฟังก์ชัน', 'lesson-8', 7, 1830, 'video', 'https://player.vimeo.com/video/1078613149', 'unknown', NULL, 1, '2026-02-19 09:50:52.765', '2026-02-19 09:50:52.765'),
(6521, 827, '343', 'ความสัมพันธ์เชิงฟังก์ชันระหว่างข้อมูลและทฤษฎีกราฟ', 'lesson-9', 8, 1196, 'video', 'https://player.vimeo.com/video/1078615038', 'unknown', NULL, 1, '2026-02-19 09:50:52.765', '2026-02-19 09:50:52.765'),
(6522, 827, '344', 'เรขาคณิตวิเคราะห์และภาคตัดกรวย', 'lesson-10', 9, 2237, 'video', 'https://player.vimeo.com/video/1078615365', 'unknown', NULL, 1, '2026-02-19 09:50:52.766', '2026-02-19 09:50:52.766'),
(6523, 827, '345', 'จำนวนเชิงซ้อน', 'lesson-11', 10, 1877, 'video', 'https://player.vimeo.com/video/1078615589', 'unknown', NULL, 1, '2026-02-19 09:50:52.766', '2026-02-19 09:50:52.766'),
(6524, 827, '346', 'สถิติ', 'lesson-12', 11, 1941, 'video', 'https://player.vimeo.com/video/1078616257', 'unknown', NULL, 1, '2026-02-19 09:50:52.767', '2026-02-19 09:50:52.767'),
(6525, 827, '347', 'แคลคูลัส', 'lesson-13', 12, 2061, 'video', 'https://player.vimeo.com/video/1078617000', 'unknown', NULL, 1, '2026-02-19 09:50:52.767', '2026-02-19 09:50:52.767'),
(6526, 827, '348', 'เวกเตอร์', 'lesson-14', 13, 1682, 'video', 'https://player.vimeo.com/video/1078617168', 'unknown', NULL, 1, '2026-02-19 09:50:52.768', '2026-02-19 09:50:52.768'),
(6527, 827, '349', 'ลำดับและอนุกรม', 'lesson-15', 14, 2721, 'video', 'https://player.vimeo.com/video/1078617342', 'unknown', NULL, 1, '2026-02-19 09:50:52.768', '2026-02-19 09:50:52.768'),
(6528, 827, '350', 'ตรีโกณมิติ', 'lesson-16', 15, 2536, 'video', 'https://player.vimeo.com/video/1078619890', 'unknown', NULL, 1, '2026-02-19 09:50:52.768', '2026-02-19 09:50:52.768'),
(6529, 828, '352', 'พื้นฐานทางคณิตศาสตร์', 'lesson-1', 0, 1244, 'video', 'https://player.vimeo.com/video/1078630501?share=copy', 'unknown', NULL, 1, '2026-02-19 09:50:52.769', '2026-02-19 09:50:52.769'),
(6530, 828, '353', 'การเคลื่อนที่แบบต่างๆ', 'lesson-2-2', 1, 6580, 'video', 'https://player.vimeo.com/video/1078631789?share=copy', 'unknown', NULL, 1, '2026-02-19 09:50:52.769', '2026-02-19 09:50:52.769'),
(6531, 828, '354', 'การเปลี่ยนหน่วย', 'lesson-3-2', 2, 2810, 'video', 'https://player.vimeo.com/video/1078632438?share=copy', 'unknown', NULL, 1, '2026-02-19 09:50:52.770', '2026-02-19 09:50:52.770'),
(6532, 828, '355', 'การโยนวัตถุขึ้น-ลง(ตกอิสระ)', 'lesson-4-2', 3, 1869, 'video', 'https://player.vimeo.com/video/1078632725?share=copy', 'unknown', NULL, 1, '2026-02-19 09:50:52.770', '2026-02-19 09:50:52.770'),
(6533, 828, '356', 'กราฟ', 'lesson-5-2', 4, 4738, 'video', 'https://player.vimeo.com/video/1078632892?share=copy', 'unknown', NULL, 1, '2026-02-19 09:50:52.770', '2026-02-19 09:50:52.770'),
(6534, 828, '357', 'สมดุลกล และโมเมนตัม', 'lesson-6-2', 5, 1275, 'video', 'https://player.vimeo.com/video/1078634543?share=copy', 'unknown', NULL, 1, '2026-02-19 09:50:52.771', '2026-02-19 09:50:52.771'),
(6535, 828, '358', 'การเคลื่อนที่แนวตรง', 'lesson-7-2', 6, 3609, 'video', 'https://player.vimeo.com/video/1078634662?share=copy', 'unknown', NULL, 1, '2026-02-19 09:50:52.771', '2026-02-19 09:50:52.771'),
(6536, 828, '359', 'คลื่น', 'lesson-8-2', 7, 3744, 'video', 'https://player.vimeo.com/video/1078634997?share=copy', 'unknown', NULL, 1, '2026-02-19 09:50:52.772', '2026-02-19 09:50:52.772'),
(6537, 828, '360', 'แสง', 'lesson-9-2', 8, 4899, 'video', 'https://player.vimeo.com/video/1078635576?share=copy', 'unknown', NULL, 1, '2026-02-19 09:50:52.772', '2026-02-19 09:50:52.772'),
(6538, 828, '361', 'เสียง', 'lesson-10-2', 9, 2735, 'video', 'https://player.vimeo.com/video/1078636443?share=copy', 'unknown', NULL, 1, '2026-02-19 09:50:52.772', '2026-02-19 09:50:52.772'),
(6539, 828, '362', 'ไฟฟ้าสถิต', 'lesson-11-2', 10, 5611, 'video', 'https://player.vimeo.com/video/1078636798?share=copy', 'unknown', NULL, 1, '2026-02-19 09:50:52.776', '2026-02-19 09:50:52.776'),
(6540, 828, '363', 'คลื่นแม่เหล็กไฟฟ้า', 'lesson-12-2', 11, 602, 'video', 'https://player.vimeo.com/video/1078637650?share=copy', 'unknown', NULL, 1, '2026-02-19 09:50:52.776', '2026-02-19 09:50:52.776'),
(6541, 828, '364', 'เทอร์โมไดนามิกส์', 'lesson-13-2', 12, 606, 'video', 'https://player.vimeo.com/video/1078637750?share=copy', 'unknown', NULL, 1, '2026-02-19 09:50:52.777', '2026-02-19 09:50:52.777'),
(6542, 828, '365', 'ไฟฟ้ากระแสสลับและแม่เหล็กไฟฟ้า', 'lesson-14-2', 13, 3061, 'video', 'https://player.vimeo.com/video/1078637820?share=copy', 'unknown', NULL, 1, '2026-02-19 09:50:52.777', '2026-02-19 09:50:52.777'),
(6543, 828, '366', 'ฟิสิกส์อะตอม', 'lesson-15-2', 14, 583, 'video', 'https://player.vimeo.com/video/1078638076?share=copy', 'unknown', NULL, 1, '2026-02-19 09:50:52.777', '2026-02-19 09:50:52.777'),
(6544, 828, '367', 'ความร้อน', 'lesson-16-2', 15, 1209, 'video', 'https://player.vimeo.com/video/1078638182?share=copy', 'unknown', NULL, 1, '2026-02-19 09:50:52.778', '2026-02-19 09:50:52.778'),
(6545, 828, '368', 'ของไหล', 'lesson-17', 16, 2285, 'video', 'https://player.vimeo.com/video/1078638288?share=copy', 'unknown', NULL, 1, '2026-02-19 09:50:52.778', '2026-02-19 09:50:52.778'),
(6546, 828, '369', 'ไฟฟ้ากระแสตรง', 'lesson-18', 17, 1825, 'video', 'https://player.vimeo.com/video/1078638590?share=copy', 'unknown', NULL, 1, '2026-02-19 09:50:52.779', '2026-02-19 09:50:52.779'),
(6547, 829, '371', 'เคมี EP.1', 'ep-1', 0, 8055, 'video', 'https://player.vimeo.com/video/1078622196?share=copy', 'unknown', NULL, 1, '2026-02-19 09:50:52.779', '2026-02-19 09:50:52.779'),
(6548, 829, '372', 'เคมี EP.2', 'ep-2', 1, 6944, 'video', 'https://player.vimeo.com/video/1078622891?share=copy', 'unknown', NULL, 1, '2026-02-19 09:50:52.780', '2026-02-19 09:50:52.780'),
(6549, 830, '374', 'บทนำชีววิทยา', 'lesson-1-2', 0, 3013, 'video', 'https://player.vimeo.com/video/1078627166?share=copy', 'unknown', NULL, 1, '2026-02-19 09:50:52.781', '2026-02-19 09:50:52.781'),
(6550, 830, '375', 'ระบบหายใจ', 'lesson-2-2-3', 1, 989, 'video', 'https://player.vimeo.com/video/1078625793?share=copy', 'unknown', NULL, 1, '2026-02-19 09:50:52.781', '2026-02-19 09:50:52.781'),
(6551, 830, '376', 'ระบบภูมิคุ้มกันและน้ำเหลือง', 'lesson-3-2-3', 2, 1030, 'video', 'https://player.vimeo.com/video/1078626292?share=copy', 'unknown', NULL, 1, '2026-02-19 09:50:52.781', '2026-02-19 09:50:52.781'),
(6552, 830, '377', 'ย่อยอาหารและหมุนเวียนเลือด', 'lesson-4-2-3', 3, 1900, 'video', 'https://player.vimeo.com/video/1078626536', 'unknown', NULL, 1, '2026-02-19 09:50:52.782', '2026-02-19 09:50:52.782'),
(6553, 830, '378', 'ระบบประสาท', 'lesson-5-2-3', 4, 1447, 'video', 'https://player.vimeo.com/video/1078627602?share=copy', 'unknown', NULL, 1, '2026-02-19 09:50:52.782', '2026-02-19 09:50:52.782'),
(6554, 830, '379', 'เซลล์และการแบ่งเซลล์', 'lesson-6-2-3', 5, 1890, 'video', 'https://player.vimeo.com/video/1078627705?share=copy', 'unknown', NULL, 1, '2026-02-19 09:50:52.782', '2026-02-19 09:50:52.782'),
(6555, 831, '3591', 'โครงสร้างพยางค์และคำ', 'lesson-1-2-3', 0, 351, 'video', 'https://player.vimeo.com/video/1153893906?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-19 09:50:52.783', '2026-02-19 09:50:52.783'),
(6556, 831, '17975', 'การใช้พยัญชนะ', 'lesson-2-2-3-4', 1, 661, 'video', 'https://player.vimeo.com/video/1153893664?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-19 09:50:52.784', '2026-02-19 09:50:52.784'),
(6557, 831, '17976', 'สระ', 'lesson-3-2-3-4', 2, 390, 'video', 'https://player.vimeo.com/video/1153894121?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-19 09:50:52.784', '2026-02-19 09:50:52.784'),
(6558, 831, '17977', 'วรรณยุกต์', 'lesson-4-2-3-4', 3, 562, 'video', 'https://player.vimeo.com/video/1153893516?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-19 09:50:52.784', '2026-02-19 09:50:52.784'),
(6559, 831, '17978', 'มาตราตัวสะกด', 'lesson-5-2-3-4', 4, 327, 'video', 'https://player.vimeo.com/video/1153893782?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-19 09:50:52.785', '2026-02-19 09:50:52.785'),
(6560, 831, '17979', 'คำเป็นคำตาย', 'lesson-6-2-3-4', 5, 209, 'video', 'https://player.vimeo.com/video/1153893951?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-19 09:50:52.785', '2026-02-19 09:50:52.785'),
(6561, 831, '17980', 'ชนิดของคำ', 'lesson-7-2-3', 6, 1846, 'video', 'https://player.vimeo.com/video/1153894012?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-19 09:50:52.785', '2026-02-19 09:50:52.785'),
(6562, 831, '17981', 'คำราชาศัพท์', '2', 7, NULL, 'video', 'https://player.vimeo.com/video/1153894161?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-19 09:50:52.786', '2026-02-19 09:50:52.786'),
(6563, 831, '17982', 'คำสุภาษิต', '2-2', 8, 193, 'video', 'https://player.vimeo.com/video/1153894235?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-19 09:50:52.786', '2026-02-19 09:50:52.786'),
(6564, 831, '17983', 'คำไทยแท้', 'lesson-10-2-3', 9, NULL, 'video', 'https://player.vimeo.com/video/1153894270?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-19 09:50:52.787', '2026-02-19 09:50:52.787'),
(6565, 831, '17984', 'คำภาษาบาลีในภาษาไทย', 'lesson-11-2-3', 10, NULL, 'video', 'https://player.vimeo.com/video/1153909376?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-19 09:50:52.787', '2026-02-19 09:50:52.787'),
(6566, 831, '17985', 'ลักษณะการยืมภาษาบาลี', 'lesson-12-2-3', 11, NULL, 'video', 'https://player.vimeo.com/video/1153909753?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-19 09:50:52.787', '2026-02-19 09:50:52.787'),
(6567, 831, '17986', 'คำบาลีวรรณคดีไทย', 'lesson-13-2-3', 12, 368, 'video', 'https://player.vimeo.com/video/1153894302?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-19 09:50:52.788', '2026-02-19 09:50:52.788'),
(6568, 831, '17987', 'การสมาส', 'lesson-14-2-3', 13, NULL, 'video', 'https://player.vimeo.com/video/1153894357?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-19 09:50:52.788', '2026-02-19 09:50:52.788'),
(6569, 831, '17988', 'ระดับภาษา', '2-2-3', 14, 517, 'video', 'https://player.vimeo.com/video/1153893863?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-19 09:50:52.789', '2026-02-19 09:50:52.789'),
(6570, 831, '17989', 'โวหาร', 'lesson-16-2-3', 15, NULL, 'video', 'https://player.vimeo.com/video/1153893823?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-19 09:50:52.789', '2026-02-19 09:50:52.789'),
(6571, 831, '17990', 'ภาพพจน์', 'lesson-17-2', 16, NULL, 'video', 'https://player.vimeo.com/video/1153893607?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-19 09:50:52.790', '2026-02-19 09:50:52.790'),
(6572, 831, '17991', 'การอ่านบทความ', '2-2-3-4', 17, NULL, 'video', 'https://player.vimeo.com/video/1153893420?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-19 09:50:52.790', '2026-02-19 09:50:52.790'),
(6573, 831, '17992', 'รายชื่อศัพท์ต่างประเทศ', 'lesson-19', 18, 146, 'video', 'https://player.vimeo.com/video/1153893742?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-19 09:50:52.791', '2026-02-19 09:50:52.791'),
(6574, 831, '17993', 'คำไทยที่ใช้ทับศัพท์', 'lesson-20', 19, 72, 'video', 'https://player.vimeo.com/video/1153911747?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-19 09:50:52.791', '2026-02-19 09:50:52.791'),
(6575, 831, '17994', 'รายชื่อศัพท์ต่างประเทศ', '2-2-3-4-5', 20, NULL, 'video', 'https://player.vimeo.com/video/1153893742?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-19 09:50:52.791', '2026-02-19 09:50:52.791'),
(6576, 831, '17995', 'คำลักษณนาม', 'lesson-22', 21, 95, 'video', 'https://player.vimeo.com/video/1153893972?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-19 09:50:52.792', '2026-02-19 09:50:52.792'),
(6577, 832, '9609', 'ภาษาอังกฤษ EP.1', 'ep-1-2', 0, 4989, 'video', 'https://player.vimeo.com/video/1101808232?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-19 09:50:52.794', '2026-02-19 09:50:52.794'),
(6578, 832, '382', 'ภาษาอังกฤษ EP.2', 'ep-2-2', 1, 3972, 'video', 'https://player.vimeo.com/video/1078624587?share=copy', 'unknown', NULL, 1, '2026-02-19 09:50:52.795', '2026-02-19 09:50:52.795'),
(6579, 833, '3592', 'สังคมศึกษา ศาสนา และวัฒนธรรม', 'lesson-1-2-3-4', 0, 16687, 'video', 'https://player.vimeo.com/video/1130457076?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-19 09:50:52.795', '2026-02-19 09:50:52.795'),
(6580, 834, '18130', 'eng 1', 'eng-1', 0, NULL, 'video', 'https:///player.vimeo.com/video/1155431776?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.049', '2026-02-24 07:22:13.049'),
(6581, 834, '18131', 'eng 2', 'eng-2', 1, NULL, 'video', 'https:///player.vimeo.com/video/1155395411?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.052', '2026-02-24 07:22:13.052'),
(6582, 834, '18132', 'eng 3', 'eng-3', 2, NULL, 'video', 'https:///player.vimeo.com/video/1155395619?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.053', '2026-02-24 07:22:13.053'),
(6583, 834, '18133', 'eng 4', 'eng-4', 3, NULL, 'video', 'https:///player.vimeo.com/video/1155395760?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.053', '2026-02-24 07:22:13.053'),
(6584, 835, '18135', 'math 1', 'math-1', 0, NULL, 'video', 'https:///player.vimeo.com/video/1155396612?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.055', '2026-02-24 07:22:13.055'),
(6585, 835, '18136', 'math 2', 'math-2', 1, NULL, 'video', 'https:///player.vimeo.com/video/1155397635?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.055', '2026-02-24 07:22:13.055'),
(6586, 835, '18137', 'math 3', 'math-3', 2, NULL, 'video', 'https:///player.vimeo.com/video/1155398556?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.056', '2026-02-24 07:22:13.056'),
(6587, 835, '18138', 'math 4', 'math-4', 3, NULL, 'video', 'https:///player.vimeo.com/video/1155399681?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.056', '2026-02-24 07:22:13.056'),
(6588, 836, '18140', 'physics 1', 'physics-1', 0, NULL, 'video', 'https:///player.vimeo.com/video/1155400328?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.058', '2026-02-24 07:22:13.058'),
(6589, 836, '18141', 'physics 2', 'physics-2', 1, NULL, 'video', 'https:///player.vimeo.com/video/1155401154?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.059', '2026-02-24 07:22:13.059'),
(6590, 836, '18142', 'physics 3', 'physics-3', 2, NULL, 'video', 'https:///player.vimeo.com/video/1155401931?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.060', '2026-02-24 07:22:13.060'),
(6591, 836, '18143', 'physics 4', 'physics-4', 3, NULL, 'video', 'https:///player.vimeo.com/video/1155402545?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.061', '2026-02-24 07:22:13.061'),
(6592, 836, '18144', 'physics 5', 'physics-5', 4, NULL, 'video', 'https:///player.vimeo.com/video/1155403416?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.061', '2026-02-24 07:22:13.061'),
(6593, 836, '18145', 'physics 6', 'physics-6', 5, NULL, 'video', 'https:///player.vimeo.com/video/1155403797?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.062', '2026-02-24 07:22:13.062'),
(6594, 836, '18146', 'physics 7', 'physics-7', 6, NULL, 'video', 'https:///player.vimeo.com/video/1155405641?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.062', '2026-02-24 07:22:13.062'),
(6595, 836, '18147', 'physics 8', 'physics-8', 7, NULL, 'video', 'https:///player.vimeo.com/video/1155410690?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.063', '2026-02-24 07:22:13.063'),
(6596, 836, '18148', 'physics 9', 'physics-9', 8, NULL, 'video', 'https:///player.vimeo.com/video/1155414054?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.064', '2026-02-24 07:22:13.064'),
(6597, 836, '18149', 'physics 10', 'physics-10', 9, NULL, 'video', 'https:///player.vimeo.com/video/1155418600?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.065', '2026-02-24 07:22:13.065'),
(6598, 836, '18152', 'physics 11', 'physics-11', 10, NULL, 'video', 'https:///player.vimeo.com/video/1155419745?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.068', '2026-02-24 07:22:13.068'),
(6599, 836, '18153', 'physics 12', 'physics-12', 11, NULL, 'video', 'https:///player.vimeo.com/video/1155420544?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.069', '2026-02-24 07:22:13.069'),
(6600, 836, '18154', 'physics 13', 'physics-13', 12, NULL, 'video', 'https:///player.vimeo.com/video/1155421970?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.069', '2026-02-24 07:22:13.069'),
(6601, 836, '18155', 'physics 14', 'physics-14', 13, NULL, 'video', 'https:///player.vimeo.com/video/1155423206?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.070', '2026-02-24 07:22:13.070'),
(6602, 836, '18156', 'physics 15', 'physics-15', 14, NULL, 'video', 'https:///player.vimeo.com/1155423982?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.071', '2026-02-24 07:22:13.071'),
(6603, 837, '18158', 'sungkhom 1', 'sungkhom-1', 0, NULL, 'video', 'https:///player.vimeo.com/video/1155425182?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.073', '2026-02-24 07:22:13.073'),
(6604, 837, '18159', 'sungkhom 2', 'sungkhom-2', 1, NULL, 'video', 'https:///player.vimeo.com/video/1155426226?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.076', '2026-02-24 07:22:13.076'),
(6605, 837, '18160', 'sungkhom 3', 'sungkhom-3', 2, NULL, 'video', 'https:///player.vimeo.com/video/1155427394?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.078', '2026-02-24 07:22:13.078'),
(6606, 837, '18161', 'sungkhom 4', 'sungkhom-4', 3, NULL, 'video', 'https:///player.vimeo.com/video/1155428692?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.081', '2026-02-24 07:22:13.081'),
(6607, 837, '18162', 'sungkhom 5', 'sungkhom-5', 4, NULL, 'video', 'https:///player.vimeo.com/video/1155429920?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.081', '2026-02-24 07:22:13.081'),
(6608, 837, '18163', 'sungkhom 6', 'sungkhom-6', 5, NULL, 'video', 'https:///player.vimeo.com/video/1155431052?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.082', '2026-02-24 07:22:13.082'),
(6609, 837, '18164', 'sungkhom 7', 'sungkhom-7', 6, NULL, 'video', 'https:///player.vimeo.com/video/1155431238?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.082', '2026-02-24 07:22:13.082'),
(6610, 837, '18165', 'sungkhom 8', 'sungkhom-8', 7, NULL, 'video', 'https:///player.vimeo.com/video/1155431396?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.083', '2026-02-24 07:22:13.083'),
(6611, 837, '18166', 'sungkhom 9', 'sungkhom-9', 8, NULL, 'video', 'https:///player.vimeo.com/video/1155431548?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.084', '2026-02-24 07:22:13.084'),
(6612, 837, '18167', 'sungkhom 10', 'sungkhom-10', 9, NULL, 'video', 'https:///player.vimeo.com/video/1155431649?share=copy&fl=sv&fe=ci', 'unknown', NULL, 1, '2026-02-24 07:22:13.084', '2026-02-24 07:22:13.084'),
(6613, 838, '18347', 'OP', 'op', 0, NULL, 'video', NULL, NULL, NULL, 1, '2026-02-24 07:22:13.086', '2026-02-24 07:22:13.086'),
(7037, 892, '390', 'คณิตศาสตร์ทั่วไป ข้อที่ 1-10', 'lesson-1', 0, 3003, 'video', 'https://player.mediadelivery.net/play/618924/8ba180e9-e3f5-46d7-8871-1f0bce3a98d8', 'unknown', NULL, 1, '2026-03-18 08:23:03.201', '2026-03-18 08:23:03.201'),
(7038, 892, '18370', 'คณิตศาสตร์ทั่วไป ข้อที่ 11-20', '2', 1, 2952, 'video', 'https://player.mediadelivery.net/play/618924/433b947c-608d-4d05-ae10-3261328039c6', 'unknown', NULL, 1, '2026-03-18 08:23:03.203', '2026-03-18 08:23:03.203'),
(7039, 892, '18457', 'คณิตศาสตร์ทั่วไป ข้อที่ 21-28', '3', 2, 2234, 'video', 'https://player.mediadelivery.net/play/618924/f379a561-823a-45f0-9876-b58f89b3f269', 'unknown', NULL, 1, '2026-03-18 08:23:03.204', '2026-03-18 08:23:03.204'),
(7040, 892, '387', 'เงื่อนไขภาษา', '2-2', 3, 3228, 'video', 'https://player.mediadelivery.net/play/618924/2466d714-adea-41a2-b854-1e1e355ae1fa', 'unknown', NULL, 1, '2026-03-18 08:23:03.205', '2026-03-18 08:23:03.205'),
(7041, 892, '388', 'โอเปอเรชัน', 'lesson-5', 4, 3252, 'video', 'https://player.mediadelivery.net/play/618924/d8beda73-24ab-4f28-a2ac-626fb688554e', 'unknown', NULL, 1, '2026-03-18 08:23:03.205', '2026-03-18 08:23:03.205'),
(7042, 892, '391', 'เงื่อนไขสัญลักษณ์ EP.1', 'ep-1', 5, 3849, 'video', 'https://player.mediadelivery.net/play/618924/4af30080-2436-40b5-851b-4ad195edc89a', 'unknown', NULL, 1, '2026-03-18 08:23:03.206', '2026-03-18 08:23:03.206'),
(7043, 892, '394', 'เงื่อนไขสัญลักษณ์ EP.2', 'ep-2', 6, 4962, 'video', 'https://player.mediadelivery.net/play/618924/7e4c0775-5dc2-4a0b-8eb1-3938166abc24', 'unknown', NULL, 1, '2026-03-18 08:23:03.206', '2026-03-18 08:23:03.206'),
(7044, 892, '395', 'เงื่อนไขสัญลักษณ์ EP.3', 'ep-3', 7, 4469, 'video', 'https://player.mediadelivery.net/play/618924/93d80920-e81a-435a-815b-51e50f1f4f37', 'unknown', NULL, 1, '2026-03-18 08:23:03.207', '2026-03-18 08:23:03.207'),
(7045, 892, '389', 'เงื่อนไขสัญลักษณ์ EP.4', 'ep-4', 8, 3813, 'video', 'https://player.mediadelivery.net/play/618924/00ce3157-1243-4fca-a586-5087a6be0a96', 'unknown', NULL, 1, '2026-03-18 08:23:03.207', '2026-03-18 08:23:03.207'),
(7046, 892, '392', 'อนุกรม', '2-2-3', 9, 2574, 'video', 'https://player.mediadelivery.net/play/618924/0252e602-84eb-4274-b1ea-ba97a62c2e39', 'unknown', NULL, 1, '2026-03-18 08:23:03.208', '2026-03-18 08:23:03.208'),
(7047, 892, '393', 'การวิเคราะห์ข้อมูลตาราง', 'lesson-11', 10, 4506, 'video', 'https://player.mediadelivery.net/play/618924/c2c9cbfa-c98d-4c38-8707-447c8b344a78', 'unknown', NULL, 1, '2026-03-18 08:23:03.208', '2026-03-18 08:23:03.208'),
(7048, 893, '397', 'ภาษาอังกฤษ EP.1', 'ep-1-2', 0, 2515, 'video', 'https://player.mediadelivery.net/play/618924/19cfb9c1-b56f-4517-a0ad-bb230f4ad8da', 'unknown', NULL, 1, '2026-03-18 08:23:03.209', '2026-03-18 08:23:03.209'),
(7049, 893, '398', 'ภาษาอังกฤษ EP.2', 'ep-2-2', 1, 3169, 'video', 'https://player.mediadelivery.net/play/618924/db2a152e-1514-4265-94d3-4af640a3cca7', 'unknown', NULL, 1, '2026-03-18 08:23:03.210', '2026-03-18 08:23:03.210'),
(7050, 894, '2078', 'การเรียบเรียงประโยค', '2-2-3-4', 0, 996, 'video', 'https://player.mediadelivery.net/play/618924/bd0a63bc-5b7d-4161-ac13-e3581e4541cd', 'unknown', NULL, 1, '2026-03-18 08:23:03.211', '2026-03-18 08:23:03.211'),
(7051, 894, '2079', 'การอ่านบทความ', '3-2', 1, 416, 'video', 'https://player.mediadelivery.net/play/618924/0b74b328-7445-4011-9a76-faedbf34f8f2', 'unknown', NULL, 1, '2026-03-18 08:23:03.211', '2026-03-18 08:23:03.211'),
(7052, 894, '2080', 'อุปมาอุปไมย', '2-2-3-4-5', 2, 1994, 'video', 'https://player.mediadelivery.net/play/618924/457cbee5-3374-4442-8ad0-e74f839ad88b', 'unknown', NULL, 1, '2026-03-18 08:23:03.213', '2026-03-18 08:23:03.213'),
(7053, 894, '2081', 'เงื่อนไขทางภาษา', '2-2-3-4-5-6', 3, 590, 'video', 'https://player.mediadelivery.net/play/618924/49f8ded7-77e1-4420-9c9f-2cd4f77c34fc', 'unknown', NULL, 1, '2026-03-18 08:23:03.215', '2026-03-18 08:23:03.215'),
(7054, 894, '2082', 'หลักภาษา 1', '1', 4, 1626, 'video', 'https://player.mediadelivery.net/play/618924/427393f8-7565-4bb2-9a1e-090e57e7c925', 'unknown', NULL, 1, '2026-03-18 08:23:03.215', '2026-03-18 08:23:03.215'),
(7055, 894, '18403', 'หลักภาษา 2', '2-2-3-4-5-6-7', 5, 2713, 'video', 'https://player.mediadelivery.net/play/618924/2c5d7c02-602a-4a41-8c2c-6b261d54f905', 'unknown', NULL, 1, '2026-03-18 08:23:03.215', '2026-03-18 08:23:03.215'),
(7056, 894, '18404', 'หลักภาษา 3', '3-2-3', 6, 1777, 'video', 'https://player.mediadelivery.net/play/618924/188a682b-db79-4de3-aad2-d88fe2879ff1', 'unknown', NULL, 1, '2026-03-18 08:23:03.216', '2026-03-18 08:23:03.216'),
(7057, 894, '18405', 'ประโยค', 'lesson-8', 7, 775, 'video', 'https://player.mediadelivery.net/play/618924/8d734e0d-a28a-41cf-98ed-c1793fb75a73', 'unknown', NULL, 1, '2026-03-18 08:23:03.216', '2026-03-18 08:23:03.216'),
(7058, 894, '18406', 'คำราชาศัพท์', '3-2-3-4', 8, 1117, 'video', 'https://player.mediadelivery.net/play/618924/7c5a39ed-6474-48ae-adbe-09734e07595d', 'unknown', NULL, 1, '2026-03-18 08:23:03.217', '2026-03-18 08:23:03.217'),
(7059, 894, '18407', 'แบบทดสอบ การเรียงประโยค', 'lesson-10', 9, 1390, 'video', 'https://player.mediadelivery.net/play/618924/f8cb8e8f-7aa7-4b66-ac22-ac228f5f310c', 'unknown', NULL, 1, '2026-03-18 08:23:03.221', '2026-03-18 08:23:03.221'),
(7060, 894, '18408', 'แบบทดสอบ ความเข้าใจภาษา', 'lesson-11-2', 10, 2162, 'video', 'https://player.mediadelivery.net/play/618924/fd516945-eb36-483e-a649-6cb680edc2a6', 'unknown', NULL, 1, '2026-03-18 08:23:03.222', '2026-03-18 08:23:03.222'),
(7061, 894, '18409', 'แบบทดสอบ อุปมาอุปไมย', 'lesson-12', 11, 2222, 'video', 'https://player.mediadelivery.net/play/618924/4fb3a354-5d46-4132-8f70-5113d824ea9c', 'unknown', NULL, 1, '2026-03-18 08:23:03.222', '2026-03-18 08:23:03.222'),
(7062, 895, '409', 'พรฎ.ว่าด้วยหลักเกณฑ์และวิธีการบริหารกิจการบ้านเมืองที่ดี พ.ศ. 2546', 'lesson-1-2', 0, 977, 'video', 'https://player.mediadelivery.net/play/618924/1baebb5f-fb40-477d-b0b1-cbe69ee3e843', 'unknown', NULL, 1, '2026-03-18 08:23:03.223', '2026-03-18 08:23:03.223'),
(7063, 895, '413', 'พรบ. วิธีปฏิบัติราชการทางปกครอง พ.ศ. 2539', '2-2-3-4-5-6-7-8', 1, 4747, 'video', 'https://player.mediadelivery.net/play/618924/d41e7c76-4591-4a93-a07c-973533387ba4', 'unknown', NULL, 1, '2026-03-18 08:23:03.226', '2026-03-18 08:23:03.226'),
(7064, 895, '401', 'พ.ร.บ.วิธีปฏิบัติราชการทางปกครอง พ.ศ. 2539 EP.1', 'lesson-3', 2, 4341, 'video', 'https://player.mediadelivery.net/play/618924/c38edaea-bac6-4ffb-a646-0449e40909a9', 'unknown', NULL, 1, '2026-03-18 08:23:03.227', '2026-03-18 08:23:03.227'),
(7065, 895, '415', 'พ.ร.บ.วิธีปฏิบัติราชการทางปกครอง พ.ศ. 2539 EP.2', '2-2-3-4-5-6-7-8-9', 3, 4379, 'video', 'https://player.mediadelivery.net/play/618924/c2898b37-7964-474a-b1a5-af076ddb6a64', 'unknown', NULL, 1, '2026-03-18 08:23:03.228', '2026-03-18 08:23:03.228'),
(7066, 895, '412', 'พ.ร.บ.ความรับผิดทางละเมิดของเจ้าหน้าที่ พ.ศ.2539', 'lesson-5-2', 4, 4288, 'video', 'https://player.mediadelivery.net/play/618924/1e59788c-a70f-43a5-a538-17a816c8c6ed', 'unknown', NULL, 1, '2026-03-18 08:23:03.228', '2026-03-18 08:23:03.228'),
(7067, 895, '411', 'พรบ.มาตรฐานจริยธรรม พ.ศ.2562', '2562', 5, 3597, 'video', 'https://player.mediadelivery.net/play/618924/bbb1ebe8-c27e-4ed4-b44f-84627bf8dd05', 'unknown', NULL, 1, '2026-03-18 08:23:03.229', '2026-03-18 08:23:03.229'),
(7068, 895, '414', 'พรบ.ระเบียบข้าราชการพลเรือน พ.ศ. 2551', 'lesson-7', 6, 4125, 'video', 'https://player.mediadelivery.net/play/618924/b3262d8a-4960-4daf-9b59-c0a465d792f6', 'unknown', NULL, 1, '2026-03-18 08:23:03.230', '2026-03-18 08:23:03.230'),
(7069, 895, '402', 'เก็งข้อสอบ', 'lesson-8-2', 7, 4255, 'video', 'https://player.mediadelivery.net/play/618924/8c58ff96-a429-4252-8c09-9ed92ef0391a', 'unknown', NULL, 1, '2026-03-18 08:23:03.230', '2026-03-18 08:23:03.230'),
(7070, 895, '403', 'เจาะลึกข้อสอบ EP.1', 'ep-1-2-3', 8, 2171, 'video', 'https://player.mediadelivery.net/play/618924/eaebeb0c-e7b8-4d78-9809-d89a2371f096', 'unknown', NULL, 1, '2026-03-18 08:23:03.231', '2026-03-18 08:23:03.231'),
(7071, 895, '405', 'เจาะลึกข้อสอบ EP.2', 'ep-2-2-3', 9, 6690, 'video', 'https://player.mediadelivery.net/play/618924/27404c6b-f196-48ee-9d9f-6856d1e33c88', 'unknown', NULL, 1, '2026-03-18 08:23:03.231', '2026-03-18 08:23:03.231'),
(7072, 895, '404', 'เจาะลึกข้อสอบ EP.3', 'ep-3-2', 10, 2678, 'video', 'https://player.mediadelivery.net/play/618924/83b722e7-e1ca-4a8d-bb21-8743bbf96b62', 'unknown', NULL, 1, '2026-03-18 08:23:03.232', '2026-03-18 08:23:03.232'),
(7073, 895, '406', 'เจาะลึกข้อสอบ EP.4', 'ep-4-2', 11, 1264, 'video', 'https://player.mediadelivery.net/play/618924/3f1fe132-ca79-4e15-b4be-341e6e21243a', 'unknown', NULL, 1, '2026-03-18 08:23:03.232', '2026-03-18 08:23:03.232'),
(7074, 895, '407', 'ตัวอย่างข้อสอบกฎหมาย EP.1', 'ep-1-2-3-4', 12, 4259, 'video', 'https://player.mediadelivery.net/play/618924/41d6833f-4ea3-4a9f-b577-e24239a07f56', 'unknown', NULL, 1, '2026-03-18 08:23:03.232', '2026-03-18 08:23:03.232'),
(7075, 895, '408', 'ตัวอย่างข้อสอบกฎหมาย EP.2', 'ep-2-2-3-4', 13, 6060, 'video', 'https://player.mediadelivery.net/play/618924/95c4ab50-dde3-4267-a2e2-6da874a392fe', 'unknown', NULL, 1, '2026-03-18 08:23:03.233', '2026-03-18 08:23:03.233'),
(7076, 895, '410', 'ตัวอย่างข้อสอบกฎหมาย EP.3', 'ep-3-2-3', 14, 3107, 'video', 'https://player.mediadelivery.net/play/618924/169737f1-97d1-4cb3-a3d8-8fe25d0f61e7', 'unknown', NULL, 1, '2026-03-18 08:23:03.233', '2026-03-18 08:23:03.233'),
(7077, 895, '17857', 'พรบ. ระเบียบบริหารราชการแผ่นดิน พ.ศ. 2534', 'lesson-16', 15, 4097, 'video', 'https://player.mediadelivery.net/play/618924/d3046487-f415-4feb-83b8-d08af7ad73e0', 'unknown', NULL, 1, '2026-03-18 08:23:03.234', '2026-03-18 08:23:03.234'),
(7078, 896, '4288', 'Test ออนไลน์ ข้อสอบ ก.พ.พร้อมนาฬิกาจับเวลา', 'test', 0, NULL, 'video', 'https://jknowledgetutor.com/test65-kp/', 'unknown', NULL, 1, '2026-03-18 08:23:03.235', '2026-03-18 08:23:03.235'),
(7079, 897, '6f55d161-8dda-4b12-9da0-9293f0c32fc5', 'ทดสอบระบบ 1', '1-2', 0, NULL, 'video', 'https://player.mediadelivery.net/embed/618924/8ba180e9-e3f5-46d7-8871-1f0bce3a98d8?playsinline=true&autoplay=false&muted=false&disableIosPlayer=false', 'unknown', NULL, 1, '2026-03-18 08:23:03.236', '2026-03-18 08:23:03.236');

-- --------------------------------------------------------

--
-- Table structure for table `lesson_completions`
--

CREATE TABLE `lesson_completions` (
  `enrollment_id` bigint(20) UNSIGNED NOT NULL,
  `lesson_id` bigint(20) UNSIGNED NOT NULL,
  `completed_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lesson_completions`
--

INSERT INTO `lesson_completions` (`enrollment_id`, `lesson_id`, `completed_at`) VALUES
(350, 4926, '2026-03-10 13:39:20.134'),
(1969, 6514, '2026-03-07 05:07:51.913'),
(25450, 827, '2026-03-19 14:34:59.971');

-- --------------------------------------------------------

--
-- Table structure for table `login_otp_requests`
--

CREATE TABLE `login_otp_requests` (
  `token` varchar(64) NOT NULL,
  `phone_number` varchar(50) NOT NULL,
  `provider_token` varchar(128) DEFAULT NULL,
  `is_dummy` tinyint(1) NOT NULL DEFAULT 0,
  `expires_at` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `login_otp_requests`
--

INSERT INTO `login_otp_requests` (`token`, `phone_number`, `provider_token`, `is_dummy`, `expires_at`, `created_at`) VALUES
('ocotp_33625dec-a679-460b-85a9-c3257c5fbb60', '0987368711', NULL, 1, '2026-03-18 13:29:43.778', '2026-03-18 13:19:43.778'),
('ocotp_c752863e-70bb-4b47-9e4e-471f58b99e77', '0822215009', NULL, 1, '2026-03-18 13:30:13.643', '2026-03-18 13:20:13.643');

-- --------------------------------------------------------

--
-- Table structure for table `modules`
--

CREATE TABLE `modules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `public_id` varchar(64) NOT NULL,
  `title` varchar(255) NOT NULL,
  `module_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `modules`
--

INSERT INTO `modules` (`id`, `course_id`, `public_id`, `title`, `module_order`, `created_at`, `updated_at`) VALUES
(660, 4, '268', 'ความรู้ความสามารถทั่วไป คณิตศาสตร์', 0, '2026-02-18 04:26:25.185', '2026-02-18 04:26:25.185'),
(661, 4, '280', 'ภาษาไทย', 1, '2026-02-18 04:26:25.190', '2026-02-18 04:26:25.190'),
(662, 4, '295', 'ภาษาอังกฤษ', 2, '2026-02-18 04:26:25.194', '2026-02-18 04:26:25.194'),
(663, 4, '313', 'ความรู้และลักษณะการเป็นข้าราชการที่ดี', 3, '2026-02-18 04:26:25.203', '2026-02-18 04:26:25.203'),
(664, 4, '4271', 'รวมไฟล์ความรู้พื้นฐานในการปฏิบัติราชการ ทั้ง 13 ฉบับ', 4, '2026-02-18 04:26:25.209', '2026-02-18 04:26:25.209'),
(665, 4, '4277', 'จำลองเสมือนจริง ข้อสอบท้องถิ่น J ท้องถิ่น TEST by J ก.พ. tutor', 5, '2026-02-18 04:26:25.210', '2026-02-18 04:26:25.210'),
(666, 4, '4280', 'Update เนื้อหา + วิดีโอติวเพิ่มเติม 2 ฉบับ', 6, '2026-02-18 04:26:25.211', '2026-02-18 04:26:25.211'),
(667, 4, '4985', 'กฎหมายสำหรับสอบภาค ข ทุกตำแหน่ง', 7, '2026-02-18 04:26:25.212', '2026-02-18 04:26:25.212'),
(689, 14, '1371', 'ฟิสิกส์', 0, '2026-02-18 04:36:40.944', '2026-02-18 04:36:40.944'),
(690, 14, '1379', 'ชีววิทยา', 1, '2026-02-18 04:36:40.947', '2026-02-18 04:36:40.947'),
(691, 14, '1385', 'คณิตศาสตร์', 2, '2026-02-18 04:36:40.950', '2026-02-18 04:36:40.950'),
(692, 14, '1394', 'ภาษาไทย', 3, '2026-02-18 04:36:40.953', '2026-02-18 04:36:40.953'),
(693, 14, '1399', 'ภาษาอังกฤษ', 4, '2026-02-18 04:36:40.956', '2026-02-18 04:36:40.956'),
(694, 14, '1410', 'สังคมศึกษา', 5, '2026-02-18 04:36:40.959', '2026-02-18 04:36:40.959'),
(695, 14, '2515', 'เคมี', 6, '2026-02-18 04:36:40.966', '2026-02-18 04:36:40.966'),
(696, 13, '1293', 'TPAT1', 0, '2026-02-18 04:38:48.813', '2026-02-18 04:38:48.813'),
(697, 13, '1310', 'คณิตศาสตร์', 1, '2026-02-18 04:38:48.820', '2026-02-18 04:38:48.820'),
(698, 13, '1318', 'ฟิสิกส์', 2, '2026-02-18 04:38:48.823', '2026-02-18 04:38:48.823'),
(699, 13, '1327', 'เคมี', 3, '2026-02-18 04:38:48.827', '2026-02-18 04:38:48.827'),
(700, 13, '1334', 'ชีววิทยา', 4, '2026-02-18 04:38:48.830', '2026-02-18 04:38:48.830'),
(701, 13, '1340', 'ภาษาไทย', 5, '2026-02-18 04:38:48.837', '2026-02-18 04:38:48.837'),
(702, 13, '1349', 'ภาษาอังกฤษ', 6, '2026-02-18 04:38:48.839', '2026-02-18 04:38:48.839'),
(703, 13, '1364', 'สังคมศึกษา', 7, '2026-02-18 04:38:48.844', '2026-02-18 04:38:48.844'),
(704, 29, '14060', 'คณิตศาสตร์', 0, '2026-02-18 04:41:05.045', '2026-02-18 04:41:05.045'),
(705, 29, '14067', 'ฟิสิกส์', 1, '2026-02-18 04:41:05.049', '2026-02-18 04:41:05.049'),
(706, 29, '14071', 'เคมี', 2, '2026-02-18 04:41:05.051', '2026-02-18 04:41:05.051'),
(707, 29, '14076', 'ชีววิทยา', 3, '2026-02-18 04:41:05.055', '2026-02-18 04:41:05.055'),
(708, 15, '1419', 'คณิตศาสตร์', 0, '2026-02-18 04:42:08.314', '2026-02-18 04:42:08.314'),
(709, 15, '1427', 'ภาษาไทย', 1, '2026-02-18 04:42:08.320', '2026-02-18 04:42:08.320'),
(710, 15, '1428', 'ภาษาอังกฤษ', 2, '2026-02-18 04:42:08.323', '2026-02-18 04:42:08.323'),
(711, 15, '1437', 'สังคมศึกษา', 3, '2026-02-18 04:42:08.328', '2026-02-18 04:42:08.328'),
(712, 15, '11193', 'TPAT5', 4, '2026-02-18 04:42:08.330', '2026-02-18 04:42:08.330'),
(713, 28, '14042', 'ภาษาไทย', 0, '2026-02-18 04:44:14.957', '2026-02-18 04:44:14.957'),
(714, 28, '14047', 'ภาษาอังกฤษ', 1, '2026-02-18 04:44:14.959', '2026-02-18 04:44:14.959'),
(715, 28, '14052', 'สังคมศึกษา', 2, '2026-02-18 04:44:14.963', '2026-02-18 04:44:14.963'),
(716, 16, '1444', 'TPAT3', 0, '2026-02-18 04:44:17.225', '2026-02-18 04:44:17.225'),
(717, 16, '1451', 'คณิตศาสตร์', 1, '2026-02-18 04:44:17.228', '2026-02-18 04:44:17.228'),
(718, 16, '1458', 'เคมี', 2, '2026-02-18 04:44:17.231', '2026-02-18 04:44:17.231'),
(719, 16, '1460', 'ภาษาอังกฤษ', 3, '2026-02-18 04:44:17.233', '2026-02-18 04:44:17.233'),
(720, 16, '2242', 'ฟิสิกส์', 4, '2026-02-18 04:44:17.237', '2026-02-18 04:44:17.237'),
(721, 27, '13981', 'คณิตศาสตร์', 0, '2026-02-18 04:46:29.070', '2026-02-18 04:46:29.070'),
(722, 27, '14002', 'ภาษาไทย', 1, '2026-02-18 04:46:29.074', '2026-02-18 04:46:29.074'),
(723, 27, '14007', 'ภาษาอังกฤษ', 2, '2026-02-18 04:46:29.077', '2026-02-18 04:46:29.077'),
(724, 27, '14012', 'สังคมศึกษา', 3, '2026-02-18 04:46:29.082', '2026-02-18 04:46:29.082'),
(725, 26, '13944', 'คณิตศาสตร์', 0, '2026-02-18 04:47:59.668', '2026-02-18 04:47:59.668'),
(726, 26, '13951', 'ฟิสิกส์', 1, '2026-02-18 04:47:59.670', '2026-02-18 04:47:59.670'),
(727, 26, '13955', 'เคมี', 2, '2026-02-18 04:47:59.672', '2026-02-18 04:47:59.672'),
(728, 26, '13970', 'ภาษาอังกฤษ', 3, '2026-02-18 04:47:59.675', '2026-02-18 04:47:59.675'),
(729, 25, '13745', 'คณิตศาสตร์', 0, '2026-02-18 04:50:08.676', '2026-02-18 04:50:08.676'),
(730, 25, '13752', 'ฟิสิกส์', 1, '2026-02-18 04:50:08.683', '2026-02-18 04:50:08.683'),
(731, 25, '13756', 'เคมี', 2, '2026-02-18 04:50:08.686', '2026-02-18 04:50:08.686'),
(732, 25, '13761', 'ชีววิทยา', 3, '2026-02-18 04:50:08.688', '2026-02-18 04:50:08.688'),
(733, 25, '13766', 'ภาษาไทย', 4, '2026-02-18 04:50:08.691', '2026-02-18 04:50:08.691'),
(734, 25, '13772', 'ภาษาอังกฤษ', 5, '2026-02-18 04:50:08.698', '2026-02-18 04:50:08.698'),
(735, 25, '13780', 'สังคมศึกษา', 6, '2026-02-18 04:50:08.704', '2026-02-18 04:50:08.704'),
(741, 23, '1793', 'ข้อสอบคณิตศาสตร์', 0, '2026-02-18 04:56:03.748', '2026-02-18 04:56:03.748'),
(742, 23, '1794', 'ข้อสอบภาษาอังกฤษ', 1, '2026-02-18 04:56:03.750', '2026-02-18 04:56:03.750'),
(743, 23, '1795', 'ข้อสอบภาษาไทย', 2, '2026-02-18 04:56:03.760', '2026-02-18 04:56:03.760'),
(744, 23, '1796', 'ข้อสอบกฎหมาย', 3, '2026-02-18 04:56:03.765', '2026-02-18 04:56:03.765'),
(745, 24, '2670', 'ภาษาอังกฤษ', 0, '2026-02-18 04:56:29.064', '2026-02-18 04:56:29.064'),
(746, 24, '2678', 'คณิตศาสตร์', 1, '2026-02-18 04:56:29.067', '2026-02-18 04:56:29.067'),
(747, 24, '2685', 'สังคมศาสตร์', 2, '2026-02-18 04:56:29.070', '2026-02-18 04:56:29.070'),
(748, 24, '2691', 'ภาษาไทย', 3, '2026-02-18 04:56:29.072', '2026-02-18 04:56:29.072'),
(755, 17, '1487', 'คณิตศาสตร์ ชุด1', 0, '2026-02-18 04:58:04.746', '2026-02-18 04:58:04.746'),
(756, 17, '1494', 'คณิตศาสตร์ ชุด2', 1, '2026-02-18 04:58:04.750', '2026-02-18 04:58:04.750'),
(757, 12, '1242', 'คณิตศาสตร์', 0, '2026-02-18 04:59:46.767', '2026-02-18 04:59:46.767'),
(758, 12, '1247', 'ฟิสิกส์', 1, '2026-02-18 04:59:46.769', '2026-02-18 04:59:46.769'),
(759, 12, '1252', 'เคมี', 2, '2026-02-18 04:59:46.770', '2026-02-18 04:59:46.770'),
(760, 12, '1258', 'ชีววิทยา', 3, '2026-02-18 04:59:46.774', '2026-02-18 04:59:46.774'),
(761, 12, '1264', 'ภาษาอังกฤษ', 4, '2026-02-18 04:59:46.778', '2026-02-18 04:59:46.778'),
(762, 12, '1267', 'ภาษาไทย', 5, '2026-02-18 04:59:46.780', '2026-02-18 04:59:46.780'),
(763, 18, '1482', 'ฟิสิกส์', 0, '2026-02-18 05:00:00.705', '2026-02-18 05:00:00.705'),
(764, 19, '1505', 'เคมี', 0, '2026-02-18 05:00:59.637', '2026-02-18 05:00:59.637'),
(765, 22, '1535', 'ภาษาอังกฤษ ชุดที่1', 0, '2026-02-18 05:01:50.782', '2026-02-18 05:01:50.782'),
(766, 22, '1540', 'ภาษาอังกฤษ ชุดที่2', 1, '2026-02-18 05:01:50.785', '2026-02-18 05:01:50.785'),
(767, 22, '1550', 'สรุปเนื้อหา', 2, '2026-02-18 05:01:50.788', '2026-02-18 05:01:50.788'),
(768, 20, '1513', 'ชีววิทยา', 0, '2026-02-18 05:02:33.031', '2026-02-18 05:02:33.031'),
(774, 21, '1521', 'สังคมศึกษา', 0, '2026-02-18 05:04:30.935', '2026-02-18 05:04:30.935'),
(775, 21, '1527', 'ภาษาไทย', 1, '2026-02-18 05:04:30.938', '2026-02-18 05:04:30.938'),
(776, 9, '955', 'สรุปเนื้อหา TGAT-ENG', 0, '2026-02-18 05:04:32.857', '2026-02-18 05:04:32.857'),
(777, 9, '957', 'แนวข้อสอบเสมือนจริง TGAT-ENG ชุดที่1', 1, '2026-02-18 05:04:32.863', '2026-02-18 05:04:32.863'),
(778, 9, '959', 'แนวข้อสอบเสมือนจริง TGAT-ENG ชุดที่2', 2, '2026-02-18 05:04:32.871', '2026-02-18 05:04:32.871'),
(779, 11, '1210', 'คณิตศาสตร์', 0, '2026-02-18 05:05:47.446', '2026-02-18 05:05:47.446'),
(780, 11, '1215', 'ฟิสิกส์', 1, '2026-02-18 05:05:47.448', '2026-02-18 05:05:47.448'),
(781, 11, '1221', 'ภาษาไทย', 2, '2026-02-18 05:05:47.450', '2026-02-18 05:05:47.450'),
(782, 11, '1227', 'ภาษาอังกฤษ', 3, '2026-02-18 05:05:47.453', '2026-02-18 05:05:47.453'),
(783, 11, '1230', 'TPAT3', 4, '2026-02-18 05:05:47.454', '2026-02-18 05:05:47.454'),
(800, 10, '968', 'คณิตศาสตร์', 0, '2026-02-18 06:27:39.565', '2026-02-18 06:27:39.565'),
(801, 10, '1011', 'ฟิสิกส์', 1, '2026-02-18 06:27:39.590', '2026-02-18 06:27:39.590'),
(802, 10, '1033', 'เคมี', 2, '2026-02-18 06:27:39.601', '2026-02-18 06:27:39.601'),
(803, 10, '1061', 'ชีววิทยา', 3, '2026-02-18 06:27:39.613', '2026-02-18 06:27:39.613'),
(804, 10, '1092', 'วิทยาศาสตร์และเทคโนโลยี', 4, '2026-02-18 06:27:39.627', '2026-02-18 06:27:39.627'),
(805, 10, '1123', 'ภาษาอังกฤษ', 5, '2026-02-18 06:27:39.646', '2026-02-18 06:27:39.646'),
(806, 10, '1175', 'ภาษาไทย', 6, '2026-02-18 06:27:39.663', '2026-02-18 06:27:39.663'),
(807, 10, '17899', 'แนวข้อสอบ Netsat', 7, '2026-02-18 06:27:39.675', '2026-02-18 06:27:39.675'),
(813, 2, '417', 'คณิตศาสตร์', 0, '2026-02-19 09:37:15.177', '2026-02-19 09:37:15.177'),
(814, 2, '424', 'ฟิสิกส์', 1, '2026-02-19 09:37:15.183', '2026-02-19 09:37:15.183'),
(815, 2, '428', 'เคมี', 2, '2026-02-19 09:37:15.186', '2026-02-19 09:37:15.186'),
(816, 2, '433', 'ชีววิทยา', 3, '2026-02-19 09:37:15.188', '2026-02-19 09:37:15.188'),
(817, 2, '438', 'ภาษาไทย', 4, '2026-02-19 09:37:15.192', '2026-02-19 09:37:15.192'),
(818, 2, '443', 'ภาษาอังกฤษ', 5, '2026-02-19 09:37:15.195', '2026-02-19 09:37:15.195'),
(819, 2, '450', 'สังคมศึกษา', 6, '2026-02-19 09:37:15.200', '2026-02-19 09:37:15.200'),
(827, 3, '334', 'คณิตศาสตร์', 0, '2026-02-19 09:50:52.762', '2026-02-19 09:50:52.762'),
(828, 3, '351', 'ฟิสิกส์', 1, '2026-02-19 09:50:52.769', '2026-02-19 09:50:52.769'),
(829, 3, '370', 'เคมี', 2, '2026-02-19 09:50:52.779', '2026-02-19 09:50:52.779'),
(830, 3, '373', 'ชีววิทยา', 3, '2026-02-19 09:50:52.780', '2026-02-19 09:50:52.780'),
(831, 3, '380', 'ภาษาไทย', 4, '2026-02-19 09:50:52.783', '2026-02-19 09:50:52.783'),
(832, 3, '381', 'ภาษาอังกฤษ', 5, '2026-02-19 09:50:52.793', '2026-02-19 09:50:52.793'),
(833, 3, '383', 'สังคมศึกษา', 6, '2026-02-19 09:50:52.795', '2026-02-19 09:50:52.795'),
(834, 30, '18129', 'อังกฤษ', 0, '2026-02-24 07:22:13.047', '2026-02-24 07:22:13.047'),
(835, 30, '18134', 'คณิตศาสตร์', 1, '2026-02-24 07:22:13.054', '2026-02-24 07:22:13.054'),
(836, 30, '18139', 'ฟิสิกส์', 2, '2026-02-24 07:22:13.057', '2026-02-24 07:22:13.057'),
(837, 30, '18157', 'สังคม', 3, '2026-02-24 07:22:13.072', '2026-02-24 07:22:13.072'),
(838, 30, '18346', 'JJKK', 4, '2026-02-24 07:22:13.085', '2026-02-24 07:22:13.085'),
(892, 1, '386', 'คณิตศาสตร์', 0, '2026-03-18 08:23:03.197', '2026-03-18 08:23:03.197'),
(893, 1, '396', 'ภาษาอังกฤษ', 1, '2026-03-18 08:23:03.209', '2026-03-18 08:23:03.209'),
(894, 1, '399', 'ภาษาไทย', 2, '2026-03-18 08:23:03.210', '2026-03-18 08:23:03.210'),
(895, 1, '400', 'ลักษณะการเป็นข้าราชการที่ดี', 3, '2026-03-18 08:23:03.223', '2026-03-18 08:23:03.223'),
(896, 1, '4286', 'Test ออนไลน์ ข้อสอบ ก.พ.', 4, '2026-03-18 08:23:03.234', '2026-03-18 08:23:03.234'),
(897, 1, 'c024832a-42c4-4c5a-b26d-c0e7c694f856', 'ทดสอบระบบ', 5, '2026-03-18 08:23:03.236', '2026-03-18 08:23:03.236');

-- --------------------------------------------------------

--
-- Table structure for table `module_access`
--

CREATE TABLE `module_access` (
  `enrollment_id` bigint(20) UNSIGNED NOT NULL,
  `module_id` bigint(20) UNSIGNED NOT NULL,
  `unlocked_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `module_access`
--

INSERT INTO `module_access` (`enrollment_id`, `module_id`, `unlocked_at`) VALUES
(13541, 696, '2026-02-18 04:40:41.895'),
(13550, 708, '2026-02-18 04:49:39.959'),
(13551, 716, '2026-02-18 04:50:09.565'),
(13553, 716, '2026-02-18 04:50:41.658'),
(25451, 757, '2026-03-24 13:13:01.402'),
(25452, 708, '2026-03-24 13:32:21.178'),
(25453, 763, '2026-03-24 13:32:53.413');

-- --------------------------------------------------------

--
-- Table structure for table `otp_request_rate_limits`
--

CREATE TABLE `otp_request_rate_limits` (
  `phone_number` varchar(50) NOT NULL,
  `attempts` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `next_allowed_at_ms` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `otp_request_rate_limits`
--

INSERT INTO `otp_request_rate_limits` (`phone_number`, `attempts`, `next_allowed_at_ms`, `created_at`, `updated_at`) VALUES
('0', 1, 1771250542857, '2026-02-16 14:01:22.856', '2026-02-16 14:01:22.857'),
('003714', 1, 1771432248241, '2026-02-18 16:29:48.240', '2026-02-18 16:29:48.242'),
('01', 1, 1771430438419, '2026-02-18 15:59:38.417', '2026-02-18 15:59:38.419'),
('0355730260', 1, 1773202728376, '2026-03-11 04:17:48.375', '2026-03-11 04:17:48.376'),
('0363862461', 1, 1771418715569, '2026-02-18 12:44:15.568', '2026-02-18 12:44:15.569'),
('0388362151', 1, 1773015014148, '2026-03-09 00:09:14.147', '2026-03-09 00:09:14.148');

-- --------------------------------------------------------

--
-- Table structure for table `shipping_orders`
--

CREATE TABLE `shipping_orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `tx_logistic_id` varchar(64) NOT NULL COMMENT 'Our unique ID sent to J&T (maps to txlogisticId)',
  `bill_code` varchar(64) DEFAULT NULL COMMENT 'J&T tracking number (waybill)',
  `sort_code` varchar(64) DEFAULT NULL COMMENT 'J&T sort code for label printing',
  `status` enum('pending','submitted','picked_up','in_transit','out_for_delivery','delivered','cancelled','failed') NOT NULL DEFAULT 'pending',
  `sender_name` varchar(255) NOT NULL,
  `sender_phone` varchar(50) NOT NULL,
  `sender_address` text NOT NULL,
  `sender_province` varchar(100) DEFAULT NULL,
  `sender_city` varchar(100) DEFAULT NULL,
  `sender_district` varchar(100) DEFAULT NULL,
  `sender_post_code` varchar(20) DEFAULT NULL,
  `receiver_name` varchar(255) NOT NULL,
  `receiver_phone` varchar(50) NOT NULL,
  `receiver_address` text NOT NULL,
  `receiver_province` varchar(100) DEFAULT NULL,
  `receiver_city` varchar(100) DEFAULT NULL,
  `receiver_district` varchar(100) DEFAULT NULL,
  `receiver_post_code` varchar(20) DEFAULT NULL,
  `weight` decimal(8,2) NOT NULL DEFAULT 1.00 COMMENT 'kg',
  `length` decimal(8,2) DEFAULT NULL COMMENT 'cm',
  `width` decimal(8,2) DEFAULT NULL COMMENT 'cm',
  `height` decimal(8,2) DEFAULT NULL COMMENT 'cm',
  `items_value` decimal(10,2) DEFAULT NULL COMMENT 'declared value in THB',
  `goods_description` varchar(500) DEFAULT NULL,
  `jt_create_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`jt_create_response`)),
  `jt_last_callback` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`jt_last_callback`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shipping_tracking_events`
--

CREATE TABLE `shipping_tracking_events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `shipping_order_id` bigint(20) UNSIGNED NOT NULL,
  `bill_code` varchar(64) NOT NULL,
  `scan_type` varchar(50) NOT NULL COMMENT 'Picked Up, Departure, Arrival, On Delivery, Signature, Problematic, Return Confirmation, Return Signature, waybill closed',
  `description` text DEFAULT NULL COMMENT 'Thai-language description of the scan type',
  `scan_time` datetime(3) DEFAULT NULL,
  `scan_city` varchar(100) DEFAULT NULL COMMENT 'J&T field: city',
  `province` varchar(100) DEFAULT NULL COMMENT 'J&T field: province',
  `entry_site` varchar(50) DEFAULT NULL COMMENT 'J&T field: entrySite (facility code)',
  `entry_site_name` varchar(255) DEFAULT NULL COMMENT 'J&T field: entrySiteName',
  `contact_number` varchar(50) DEFAULT NULL COMMENT 'J&T field: contactNumber',
  `scanners` varchar(255) DEFAULT NULL COMMENT 'J&T field: scanners',
  `sent_to` varchar(50) DEFAULT NULL COMMENT 'Departure: destination facility code',
  `sent_to_name` varchar(255) DEFAULT NULL COMMENT 'Departure: destination facility name',
  `sig_pic_url` text DEFAULT NULL COMMENT 'Signature: URL to signed photo',
  `remark` text DEFAULT NULL COMMENT 'Problematic: problem description',
  `raw_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Full raw detail object from callback' CHECK (json_valid(`raw_json`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shop_banners`
--

CREATE TABLE `shop_banners` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `image_url` text NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shop_banners`
--

INSERT INTO `shop_banners` (`id`, `title`, `subtitle`, `image_url`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Super Brand Day', 'Up to 23% off', '/shop/banners/hero-1.webp', 1, 1, '2026-02-02 00:08:01.113', '2026-02-02 23:08:04.041'),
(2, 'Hot Deals', 'Flash sale', '/shop/banners/hero-2.webp', 2, 1, '2026-02-02 00:08:01.113', '2026-02-02 23:08:06.807'),
(3, 'Learn & Save', 'Courses & Books', '/shop/banners/hero-3.webp', 3, 1, '2026-02-02 00:08:01.113', '2026-02-02 23:08:08.813'),
(4, 'Extra Vouchers', 'Save more', '/shop/banners/promo-1.webp', 4, 1, '2026-02-02 00:08:01.113', '2026-02-02 23:08:10.837'),
(5, 'Extra Vouchers', 'Deals from ฿200', '/shop/banners/promo-2.webp', 5, 1, '2026-02-02 00:08:01.113', '2026-03-31 20:30:35.107');

-- --------------------------------------------------------

--
-- Table structure for table `shop_coupons`
--

CREATE TABLE `shop_coupons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(64) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `type` enum('percent','fixed') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `min_subtotal` decimal(10,2) DEFAULT NULL,
  `max_uses` int(10) UNSIGNED DEFAULT NULL,
  `uses_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `max_uses_per_user` int(10) UNSIGNED DEFAULT NULL,
  `starts_at` datetime(3) DEFAULT NULL,
  `ends_at` datetime(3) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shop_coupons`
--

INSERT INTO `shop_coupons` (`id`, `code`, `description`, `type`, `amount`, `min_subtotal`, `max_uses`, `uses_count`, `max_uses_per_user`, `starts_at`, `ends_at`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'S10', '10% off (demo)', 'percent', 10.00, 0.00, NULL, 0, NULL, NULL, NULL, 1, '2026-02-03 21:47:41.044', '2026-02-03 22:19:09.387'),
(2, 'P50', '50 THB off orders over 500 (demo)', 'fixed', 50.00, 500.00, NULL, 0, NULL, NULL, NULL, 1, '2026-02-03 21:47:41.066', '2026-02-03 22:20:10.741');

-- --------------------------------------------------------

--
-- Table structure for table `shop_coupon_redemptions`
--

CREATE TABLE `shop_coupon_redemptions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `coupon_id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `code` varchar(64) NOT NULL,
  `discount_amount` decimal(10,2) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shop_orders`
--

CREATE TABLE `shop_orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `public_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `receiver_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `customer_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `customer_phone` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `shipping_address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `currency` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'THB',
  `coupon_code` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending','paid','cancelled','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'pending',
  `shipping_status` enum('pending','processing','shipped') NOT NULL DEFAULT 'pending',
  `tracking_number` varchar(100) DEFAULT NULL,
  `shipping_notes` text DEFAULT NULL,
  `printed_at` datetime(3) DEFAULT NULL,
  `shipped_at` datetime(3) DEFAULT NULL,
  `bill_code` varchar(64) DEFAULT NULL,
  `gateway` enum('paysolutions') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'paysolutions',
  `gateway_reference` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `gateway_status_code` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `gateway_raw_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `shop_orders`
--

INSERT INTO `shop_orders` (`id`, `public_id`, `user_id`, `receiver_name`, `customer_email`, `customer_phone`, `shipping_address`, `currency`, `coupon_code`, `subtotal`, `discount_total`, `total`, `status`, `shipping_status`, `tracking_number`, `shipping_notes`, `printed_at`, `shipped_at`, `bill_code`, `gateway`, `gateway_reference`, `gateway_status_code`, `gateway_raw_json`, `created_at`, `updated_at`) VALUES
(3, 'so_12ba1376ccc11b0a6f071835', 1, 'จักรพันธ์ แก้วศิริ', 'kaewsiri@outlook.com', '0830121275', '123 Moo 16, Mittraphap Rd., Nai-Muang, Muang District, Khon Kaen 40002, Thailand.', 'THB', NULL, 690.00, 0.00, 690.00, 'paid', 'pending', NULL, NULL, '2026-03-31 20:23:00.144', NULL, NULL, 'paysolutions', 'trxn-311087467591', 'DEV_PAID', '{\"devMode\":true,\"simulatedAt\":\"2026-03-28T15:39:59.331Z\"}', '2026-03-28 22:39:59.326', '2026-03-31 20:24:46.000'),
(4, 'so_975de408418b8190cf065b46', 1, 'จักรพันธ์ แก้วศิริ', 'kaewsiri@outlook.com', '0830121275', '123', 'THB', NULL, 490.00, 0.00, 490.00, 'paid', 'shipped', 'TH123456789', NULL, '2026-03-31 20:23:57.526', '2026-03-31 20:25:03.496', NULL, 'paysolutions', 'trxn-784579984094', 'DEV_PAID', '{\"devMode\":true,\"simulatedAt\":\"2026-03-31T06:58:50.878Z\"}', '2026-03-31 13:58:50.870', '2026-03-31 20:25:03.496'),
(5, 'so_90c2f4a50f530c8a3ba085b4', 1, 'จักรพันธ์ แก้วศิริ', 'kaewsiri@outlook.com', '0830121275', '123 ขอนแก่น', 'THB', NULL, 490.00, 0.00, 490.00, 'paid', 'processing', NULL, NULL, '2026-03-31 20:25:08.527', NULL, NULL, 'paysolutions', 'trxn-731555180939', 'DEV_PAID', '{\"devMode\":true,\"simulatedAt\":\"2026-03-31T12:49:32.307Z\"}', '2026-03-31 19:49:32.297', '2026-03-31 20:25:08.528');

-- --------------------------------------------------------

--
-- Table structure for table `shop_order_items`
--

CREATE TABLE `shop_order_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `product_public_id` varchar(64) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `compare_at_price` decimal(10,2) DEFAULT NULL,
  `line_total` decimal(10,2) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shop_order_items`
--

INSERT INTO `shop_order_items` (`id`, `order_id`, `product_public_id`, `product_name`, `quantity`, `unit_price`, `compare_at_price`, `line_total`, `created_at`) VALUES
(1, 2, 'test_prod_1', 'Test Book', 1, 100.00, NULL, 100.00, '2026-03-28 22:38:12.158'),
(2, 3, 'book-587', 'หนังสือเตรียมสอบสายแพทย์(แพทย์ ทันตะ สัตวแพทย์ เภสัช เทคนิคการแพทย์ สหเวช)+คอร์สติว 40 ชม.', 1, 690.00, NULL, 690.00, '2026-03-28 22:39:59.327'),
(3, 4, 'book-742', 'หนังสือ แนวข้อสอบเสมือนจริง ครู ครุศาสตร์ + คอร์สติวเฉลยข้อสอบ 25 ชม.', 1, 490.00, NULL, 490.00, '2026-03-31 13:58:50.877'),
(4, 5, 'book-583', 'หนังสือเตรียมสอบA-Levelพิชิต TCAS69-70-71 ม.ปลาย เกณฑ์ใหม่ สสวท.ฟรีคอร์สติว 20 ชม.', 1, 490.00, NULL, 490.00, '2026-03-31 19:49:32.301');

-- --------------------------------------------------------

--
-- Table structure for table `shop_products`
--

CREATE TABLE `shop_products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `public_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `category` enum('course','book','camp','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tags_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `compare_at_price` decimal(10,2) DEFAULT NULL,
  `stock_left` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `sold_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `external_url` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `badge` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `shop_products`
--

INSERT INTO `shop_products` (`id`, `public_id`, `name`, `category`, `description`, `details`, `tags_json`, `price`, `compare_at_price`, `stock_left`, `sold_count`, `external_url`, `badge`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(532, 'book-532', 'หนังสือเตรียมสอบ NETSAT มข. เล่มเดียวครบทั้ง SAT I และ SAT II ฟรี! คอร์สติว 21 ชม.', 'book', '<p class=\"QN2lPu\">หนังสือเตรียมสอบ NETSAT มข. 68-69 เล่มเดียวจบ ครบทั้ง SAT I และ SAT II ครบทุกความฉลาดรู้ พิชิต NETSAT มข. 68-69 พร้อมสอบติดโควตา มข. 68-69 !! การันตีด้วยผลงานลูกศิษย์สอบติดจริงโควตา มข. 66 จำนวนมาก</p>', '<p class=\"QN2lPu\">📙หนังสือเตรียมสอบ NETSAT มข. 68-69 เล่มเดียวจบ ครบทั้ง SAT I และ SAT II ครบทุกความฉลาดรู้ พิชิต NETSAT มข. 68-69 พร้อมสอบติดโควตา มข. 68-69 !! การันตีด้วยผลงานลูกศิษย์สอบติดจริงโควตา มข. 66 จำนวนมาก</p>\n\\n<p class=\"QN2lPu\">คุณสมบัติ</p>\n\\n<p class=\"QN2lPu\">✔สรุปกระชับ</p>\n\\n<p class=\"QN2lPu\">✔เนื้อหาแม่นยำ</p>\n\\n<p class=\"QN2lPu\">✔ครบถ้วนทุกความฉลาดรู้ตามโครงสร้างข้อสอบ NETSAT มข. 66</p>\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบ NETSAT มข. แน่นๆ</p>\n\\n<p class=\"QN2lPu\">✔เฉลยละเอียดในเล่มทุกข้อ พร้อมเทคนิคคิดลัดตัดช้อย</p>\n\\n<p class=\"QN2lPu\">✔หนังสือครบคุณภาพ 500 หน้า ฟรีถึงบ้าน</p>\n\\n<p class=\"QN2lPu\">✔สำหรับสอบเข้าทุกคณะ ทุกสาขา รอบ 2 โควตา มข.</p>\n\\n<p class=\"QN2lPu\">✔เขียนโดยทีมสุดยอดติวเตอร์คุณภาพจากรั้ว มข. และจุฬาฯ</p>\n\\n<p class=\"QN2lPu\">💥ฟรี!! คอร์สติวสอบ NETSAT มข. 21 ชม. เต็ม</p>\n\\n<p class=\"QN2lPu\">💯การันตีด้วยผลงานลูกศิษย์สอบติดจริงโควตา มข. 64 จำนวนมาก</p>\n\\n<p class=\"QN2lPu\">ใหม่ล่าสุดสำหรับน้อง ม. 5 - 6 เตรียมสอบเข้ารอบโควตา ม.ขอนแก่น (รอบ 2)</p>\n\\n<p class=\"QN2lPu\">💚การันตีด้วยผลงานพี่ๆศิษย์เก่าค่าย J knowledge สอบจริง! ติดจริง! รอบ2 โควตา มข. จากหลากหลายสายคณะ</p>\n\\n<p class=\"QN2lPu\">💚ผลงานจริงสอบสมรรถนะ มข. (คณิตฯ) 100 คะแนนเต็ม 💯 และคะแนนสอบ 97.5 , 95 , 92.5 คะแนน เข้ากลุ่มลับติวได้ทันที</p>\n\\n<p class=\"QN2lPu\">ในเล่มครบถ้วนทุกหัวข้อตามโครงสร้างข้อสอบ NETSAT มข. 66</p>\n\\n<p class=\"QN2lPu\">ครบทั้ง SAT I และ SAT II ครบทุกความฉลาดรู้</p>\n\\n<p class=\"QN2lPu\">SAT I ความฉลาดรู้ทั่วไป</p>\n\\n<p class=\"QN2lPu\">........ 1. ความฉลาดรู้ทั่วไป ด้านภาษาไทย</p>\n\\n<p class=\"QN2lPu\">ด้านภาษาอังกฤษ</p>\n\\n<p class=\"QN2lPu\">....... 2. ความฉลาดรู้ทั่วไป ด้านคณิตศาสตร์</p>\n\\n<p class=\"QN2lPu\">SAT II ความฉลาดรู้เฉพาะด้าน</p>\n\\n<p class=\"QN2lPu\">.........ความฉลาดรู้เฉพาะด้าน วิทยาศาสตร์ และเทคโนโลยี</p>\n\\n<p class=\"QN2lPu\">.........ความฉลาดรู้เฉพาะด้าน ฟิสิกส์</p>\n\\n<p class=\"QN2lPu\">.........ความฉลาดรู้เฉพาะด้าน เคมี</p>\n\\n<p class=\"QN2lPu\">.........ความฉลาดรู้เฉพาะด้าน ชีววิทยา</p>\n\\n<p class=\"QN2lPu\">🔥ฟรี คอร์สติวสรุปเนื้อหา NETSAT มข. และเฉลยอธิบายละเอียดแนวข้อสอบ NETSAT มข. ครบ จบ พร้อมสอบ ทั้งหมด 21 ชั่วโมง</p>\n\\n<p class=\"QN2lPu\">สั่งซื้อแล้ว เข้ากลุ่มลับติวได้ทันที ฟรี!!!!!</p>\n\\n<p class=\"QN2lPu\">#NETSAT #NETSATมข #โควตามข #โควตามข68 #โควตามข69 #โควตามข70 #โควตามข71#มหาวิทยาลัยขอนแก่น #TCAS #NETSATมข68 #NETSATมข69 #NETSATมข70 #NETSATมข71 #มข #มข68 #มข69 #มข70 #มข71 #NETSAT68 #NETSAT69 #NETSAT70 #NETSAT71 #DEK68 #DEK69 #DEK70 #DEK71</p>\n\\n<p class=\"QN2lPu\">***สำหรับน้องๆ ที่สแกน Qr Code ไม่ได้/หรือไม่ได้รับ Qr Code สามารถทักแอดมินได้เลยครับ***</p>', '[\"Netsat\"]', 590.00, 1690.00, 0, 0, NULL, NULL, 0, 1, '2026-02-02 22:49:49.475', '2026-02-02 22:55:22.352'),
(582, 'book-582', 'หนังสือสรุปเนื้อหา ม.ปลาย A-Level TCAS69-70-71 เกณฑ์ใหม่ สสวท. ฟรีคอร์สติว 25 ชม.', 'book', 'หนังสือที่เป็นมากกว่าหนังสือ กับหนังสือสรุปเนื้อหา ม.ปลาย พร้อมคอร์สติวสรุป 25 ชม. พิชิต TCAS69-70-71 เกณฑ์ใหม่ ตามแนวข้อสอบจริง(test blueprint) ที่ออกสอบบ่อยที่สุด ทุกสนาม พร้อมสอบ A-Level (วิชาสามัญ) ครบทุกวิชาในเล่มเดียว', '<p class=\"QN2lPu\">หนังสือสรุปเนื้อหา ม.ปลาย เตรียมสอบTCAS พิชิต A-Level #DEK69-70-71 ต้องมี 📌[ส่งฟรีไม่ง้อโค้ด]📌</p>\r\n\\n<p class=\"QN2lPu\">หนังสือที่เป็นมากกว่าหนังสือ กับหนังสือสรุปเนื้อหา ม.ปลาย พร้อมคอร์สติวสรุป 25 ชม. พิชิต TCAS69-70-71 เกณฑ์ใหม่ ตามแนวข้อสอบจริง(test blueprint) ที่ออกสอบบ่อยที่สุด ทุกสนาม พร้อมสอบ A-Level (วิชาสามัญ) ครบทุกวิชาในเล่มเดียว</p>\r\n\\n<p class=\"QN2lPu\">เข้าใจแน่ แค่มีเล่มนี้ 📌📌📌</p>\r\n\\n<p class=\"QN2lPu\">📗 หนังสือ + วิดีโอ สรุปเนื้อหา ม.ปลาย เตรียมสอบ A-Level เล่มเดียวจบครบทุกวิชา</p>\r\n\\n<p class=\"QN2lPu\">✅ สรุปสาระสำคัญ เนื้อหา A-Level ครบ 7 วิชา ในเล่มเดียว👌 TCAS69-70-71 เกณฑ์ใหม่</p>\r\n\\n<p class=\"QN2lPu\">ตามแนว สสวท.</p>\r\n\\n<p class=\"QN2lPu\">-คณิตศาสตร์ประยุกต์</p>\r\n\\n<p class=\"QN2lPu\">-ฟิสิกส์</p>\r\n\\n<p class=\"QN2lPu\">-เคมี</p>\r\n\\n<p class=\"QN2lPu\">-ชีววิทยา</p>\r\n\\n<p class=\"QN2lPu\">-ภาษาไทย</p>\r\n\\n<p class=\"QN2lPu\">-ภาษาอังกฤษ</p>\r\n\\n<p class=\"QN2lPu\">-สังคมศึกษา</p>\r\n\\n<p class=\"QN2lPu\">หนังสือสรุปเนื้อหา ม.ปลาย + คอร์สสรุปเนื้อหา ม.ปลาย 25 ชม. เตรียมสอบ A-Level เล่มเดียวจบครบทุกวิชา 📗</p>\r\n\\n<p class=\"QN2lPu\">✅ สรุปสาระสำคัญ เนื้อหาครบ 7 วิชา ในเล่มเดียว👌</p>\r\n\\n<p class=\"QN2lPu\">ทำไมต้องอ่านหนังสือเล่มนี้!</p>\r\n\\n<p class=\"QN2lPu\">✔️ สรุปประเด็นสำคัญ เจาะประเด็นที่ออกสอบบ่อยที่สุดทั้ง 7 วิชา</p>\r\n\\n<p class=\"QN2lPu\">✔️ FREE! คอร์สติวสรุปเนื้อหาม.ปลาย อธิบายเน้น เจาะประเด็นที่ออกสอบ กว่า 25 ชม.</p>\r\n\\n<p class=\"QN2lPu\">✔️ เล่มเดียวจบครบทุกวิชา เตรียมตัวเข้าห้องสอบได้เลย</p>\r\n\\n<p class=\"QN2lPu\">⭐️สิ่งที่น้อง ๆ จะได้รับ ⭐️</p>\r\n\\n<p class=\"QN2lPu\">1. หนังสือสรุป เนื้อหาม.ปลาย ครบทั้ง 7 วิชา</p>\r\n\\n<p class=\"QN2lPu\">2. คอร์สเฉลยละเอียดข้อสอบทุกวิชา กว่า 25 ชม.</p>\r\n\\n<p class=\"QN2lPu\">3. เนื้อหาตามโครงสร้างของข้อสอบ</p>\r\n\\n<p class=\"QN2lPu\">#หนังสือเตรียมสอบ #หนังสือสรุปมปลาย #หนังสือสรุปเนื้อหาทุกวิชา #สรุปTCAS #สรุปชีวะ #สรุปคณิต #สรุปเคมี #สรุปฟิสิกส์ #สรุปภาษาไทย #สรุปภาษาอังกฤษ #สรุปสังคม #เตรียมสอบมปลาย #รวมเนื้อหามปลาย #ติวสอบ #เข้ามหาลัย #TCAS69 #TCAS70 #TCAS71 #dek69 #dek70 #dek71 #A-level #JKNOWLEDGE #TGAT #TPAT #TCASเกณฑ์ใหม่ #เด็ก69 #เด็ก70 #เด็ก71 #A-level69 #A-level70 #A-level71</p>\r\n\\n<p class=\"QN2lPu\">***สำหรับน้องๆ ที่สแกน Qr Code ไม่ได้/หรือไม่ได้รับ Qr Code สามารถทักแอดมินได้เลยครับ***</p>\r\n\\n<p class=\"QN2lPu\">#หนังสือสรุปเนื้อหา ม.ปลาย TCAS69-70-71 เกณฑ์ใหม่ สสวท. ฟรีคอร์สติว 25 ชม.</p>', '[\"TCAS\"]', 490.00, 990.00, 0, 0, NULL, NULL, 0, 1, '2026-02-02 22:49:49.475', '2026-02-02 22:49:49.475'),
(583, 'book-583', 'หนังสือเตรียมสอบA-Levelพิชิต TCAS69-70-71 ม.ปลาย เกณฑ์ใหม่ สสวท.ฟรีคอร์สติว 20 ชม.', 'book', 'หนังสือแนวข้อสอบ A-Level เสมือนจริงตามโครงสร้างข้อสอบจริง (Test blueprint) พร้อมคอร์สเฉลยข้อสอบละเอียดทุกข้อกว่า 20 ชม.', '<p class=\"QN2lPu\">หนังสือแนวข้อสอบ A-Level เสมือนจริงตามโครงสร้างข้อสอบจริง (Test blueprint) พร้อมคอร์สเฉลยข้อสอบละเอียดทุกข้อกว่า 20 ชม.</p>\r\n\\n<p class=\"QN2lPu\">มาเตรียมพร้อมโค้งสุดท้ายก่อนสอบ พิชิต TCAS69-70-71 เกณฑ์ใหม่ ตามโครงสร้างข้อสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">ครบจบทุกวิชารวมไว้ให้แล้วในเล่มเดียว 👉พร้อมสอบ A-Level เดือนมีนาคม 69</p>\r\n\\n<p class=\"QN2lPu\">เหมาะสำหรับน้องๆที่อยากฝึกทำข้อสอบเสมือนจริง เตรียมพร้อมโค้งสุดท้ายก่อนเจอสนามสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">เก็บแต้มอัพคะแนนเพิ่มแน่ แค่มีเล่มนี้ 📌📌📌</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบแม่นยำ</p>\r\n\\n<p class=\"QN2lPu\">✔ครบถ้วนตามโครงสร้างข้อสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบ A-Level แน่นๆ</p>\r\n\\n<p class=\"QN2lPu\">✔เฉลยละเอียดในเล่มทุกข้อ พร้อมเทคนิคคิดลัดตัดช้อย</p>\r\n\\n<p class=\"QN2lPu\">✔สำหรับสอบเข้าทุกคณะ ทุกสาขา</p>\r\n\\n<p class=\"QN2lPu\">✔เขียนโดยทีมสุดยอดติวเตอร์คุณภาพจากรั้วจุฬาฯ มหิดล</p>\r\n\\n<p class=\"QN2lPu\">หนังสือแนวข้อสอบ A-Level พร้อมเฉลยละเอียด 💥ฟรี!! คอร์สติวเฉลย A-Level ละเอียดทุกข้อ 20 ชม.</p>\r\n\\n<p class=\"QN2lPu\">พร้อมเตรียมสอบ A-Level เล่มเดียวจบครบทุกวิชา</p>\r\n\\n<p class=\"QN2lPu\">✅ แนวข้อสอบพร้อมเฉลยละเอียดครบ 7 วิชา ในเล่มเดียว👌</p>\r\n\\n<p class=\"QN2lPu\">TCAS67 เกณฑ์ใหม่ ตามแนวข้อสอบจริง (Test blueprint)</p>\r\n\\n<p class=\"QN2lPu\">-คณิตศาสตร์ประยุกต์ 1</p>\r\n\\n<p class=\"QN2lPu\">-ฟิสิกส์</p>\r\n\\n<p class=\"QN2lPu\">-เคมี</p>\r\n\\n<p class=\"QN2lPu\">-ชีววิทยา</p>\r\n\\n<p class=\"QN2lPu\">-ภาษาไทย</p>\r\n\\n<p class=\"QN2lPu\">-ภาษาอังกฤษ</p>\r\n\\n<p class=\"QN2lPu\">-สังคมศึกษา</p>\r\n\\n<p class=\"QN2lPu\">⭐️สิ่งที่น้อง ๆ จะได้รับ ⭐️</p>\r\n\\n<p class=\"QN2lPu\">1. หนังสือแนวข้อสอบ A-Level ครบทั้ง 7 วิชา เล่มเดียวจบครบทุกวิชา</p>\r\n\\n<p class=\"QN2lPu\">2. คอร์สเฉลยละเอียดข้อสอบทุกวิชา กว่า 20 ชม.</p>\r\n\\n<p class=\"QN2lPu\">3. เนื้อหาตามโครงสร้างของข้อสอบ</p>\r\n\\n<p class=\"QN2lPu\">#หนังสือเตรียมสอบ #แนวข้อสอบA-level #หนังสือแนวข้อสอบทุกวิชา #แนวข้อสอบชีวะ #แนวข้อสอบคณิต #แนวข้อสอบเคมี #แนวข้อสอบฟิสิกส์ #แนวข้อสอบภาษาไทย #แนวข้อสอบภาษาอังกฤษ #แนวข้อสอบสังคม #เตรียมสอบม.ปลาย #รวมเนื้อหาม.ปลาย #ติวสอบ #เข้ามหาลัย #TCAS69 #TCAS70 #TCAS71 #dek69 #dek70 #dek71 #A-level #JKNOWLEDGE #TGAT #TPAT #TCASเกณฑ์ใหม่ #เด็ก69 #เด็ก70 #เด็ก71 #A-level69 #A-level70 #A-level71</p>\r\n\\n<p class=\"QN2lPu\">***สำหรับน้องๆ ที่สแกน Qr Code ไม่ได้/หรือไม่ได้รับ Qr Code สามารถทักแอดมินได้เลยครับ***</p>\r\n\\n<p class=\"QN2lPu\">#หนังสือเตรียมสอบ ม.ปลาย A-Level พิชิต TCAS69-70-71 เกณฑ์ใหม่ สสวท. ฟรี คอร์สติว 20 ชม.</p>', '[\"Alevel\"]', 490.00, 990.00, 0, 0, NULL, NULL, 0, 1, '2026-02-02 22:49:49.475', '2026-02-02 22:49:49.475'),
(584, 'book-584', 'หนังสือติวสอบ ก.พ. พร้อมติวและเฉลยข้อสอบจริง ก.พ. (ภาค ก) 68 ฟรี! คอร์สติว 40 ชม.', 'book', 'หนังสือติวสอบ ก.พ. ฉบับคนมีเวลาน้อยต้องดู 📌📌หนังสือติวและเฉลยข้อสอบจริง ก.พ าค ก) 68. (ภาค ก) 68 เล่มเดียวจบ ครบทุกเรื่องที่ออกสอบ อ่านจบ สอบผ่านเลย 💯', '<p class=\"QN2lPu\">หนังสือติวสอบ ก.พ. ฉบับคนมีเวลาน้อยต้องดู 📌📌หนังสือติวและเฉลยข้อสอบจริง ก.พ าค ก) 68. (ภาค ก) 68 เล่มเดียวจบ ครบทุกเรื่องที่ออกสอบ อ่านจบ สอบผ่านเลย 💯</p>\r\n\\n<p class=\"QN2lPu\">อยากสอบ ก.พ. ครั้งเดียวผ่าน ต้องนี่เลยย...</p>\r\n\\n<p class=\"QN2lPu\">หนังสือติวสอบ ก.พ. 68 (ฉบับป รับปรุงใหม่ล่าสุด) พร้อมคอร์สติวเฉลยละเอียดกว่า 40 ชม. ดูได้ไม่จำกัด</p>\r\n\\n<p class=\"QN2lPu\">- สรุปเนื้อหาสำคัญ ครบ 4 วิชา</p>\r\n\\n<p class=\"QN2lPu\">- ตรงโครงสร้างที่ออกสอบ</p>\r\n\\n<p class=\"QN2lPu\">- ไม่มีพื้นฐาน มีเวลาน้อยก็อ่านได้</p>\r\n\\n<p class=\"QN2lPu\">- เทคนิคลัด ตะลุยโจทย์ ทำข้อสอบได้ทันเวลา</p>\r\n\\n<p class=\"QN2lPu\">- พร้อมข้อสอบจริง ก.พ. (สอบ 8, 29 พ.ค. 65) และแนวข้อสอบกว่า 500 ข้อ</p>\r\n\\n<p class=\"QN2lPu\">จ่ายแค่ 590.- แต่ได้รับของแถมถึง 8 อย่าง (โคตรคุ้ม!)</p>\r\n\\n<p class=\"QN2lPu\">หนังสือติวสอบ ก.พ.68 ฉบับปรังปรุงใหม่ล่าสุด ตรงกับโครงสร้างที่ออกสอบ</p>\r\n\\n<p class=\"QN2lPu\">พร้อมสรุปครบทั้ง 4 วิชา (คณิต ไทย Eng กฎหมาย)</p>\r\n\\n<p class=\"QN2lPu\">แถมฟรี!</p>\r\n\\n<p class=\"QN2lPu\">1. คอร์สติว 40 ชม. ดูซ้ำได้ไม่จำกัด</p>\r\n\\n<p class=\"QN2lPu\">2. ข้อสอบจริงก.พ. (สอบวันที่ 8 และ 29 พ.ค.65) พร้อมเฉลยละเอียด</p>\r\n\\n<p class=\"QN2lPu\">3. ข้อสอบจริง ก.พ. และแนวข้อสอบ กว่า 500 ข้อ</p>\r\n\\n<p class=\"QN2lPu\">4. Test ข้อสอบจริง ก.พ. แบบออนไลน์ พร้อมนาฬิกาจับเวลา!</p>\r\n\\n<p class=\"QN2lPu\">5. ไฟล์ พ.ร.บ. ฉบับจริง จำนวน 6 ฉบับ</p>\r\n\\n<p class=\"QN2lPu\">6. เทคนิคสอบผ่าน ทำข้อสอบทันเวลา</p>\r\n\\n<p class=\"QN2lPu\">7. กระดาษคำตอบ ไว้ฝึกทำข้อสอบ แบบ Paper &amp; Pencil</p>\r\n\\n<p class=\"QN2lPu\">8. ตารางเตรียมตัวอ่านหนังสือ</p>\r\n\\n<p class=\"QN2lPu\">*** ทุกออเดอร์ มีวีดีโอให้ 40 ชั่วโมง 💻***</p>', '[\"local\"]', 590.00, 1690.00, 0, 0, NULL, NULL, 0, 1, '2026-02-02 22:49:49.475', '2026-02-02 22:49:49.475'),
(587, 'book-587', 'หนังสือเตรียมสอบสายแพทย์(แพทย์ ทันตะ สัตวแพทย์ เภสัช เทคนิคการแพทย์ สหเวช)+คอร์สติว 40 ชม.', 'book', 'น้องม.4-ม.6 ที่อยากติดคณะในสายแพทย์ ทันตะ เภสัช สัตวแพทย์ เทคนิคการแพทย์-สหเวชฯ ห้ามพลาดกับเล่มนี้ เล่มเดียวจบ ครบทุกวิชาที่ใช้สอบสายแพทย์ ฟรี คอร์สเฉลยข้อสอบอย่างละเอียด กว่า 40 ชั่วโมง', '<p class=\"QN2lPu\">น้องม.4-ม.6 ที่อยากติดคณะในสายแพทย์ ทันตะ เภสัช สัตวแพทย์ เทคนิคการแพทย์-สหเวชฯ ห้ามพลาดกับเล่มนี้ เล่มเดียวจบ ครบทุกวิชาที่ใช้สอบสายแพทย์ ฟรี คอร์สเฉลยข้อสอบอย่างละเอียด กว่า 40 ชั่วโมง</p>\r\n\\n<p class=\"QN2lPu\">👨‍⚕หนังสือเตรียมสอบสายแพทย์ วิทยาศาสตร์สุขภาพ + คอร์สติวเฉลยข้อสอบ กว่า 40 ชั่วโมง</p>\r\n\\n<p class=\"QN2lPu\">เตรียมความพร้อมสู่สายแพทย์ แพทย์ ทันตะ เภสัช สัตวแพทย์ เทคนิคการแพทย์ สหเวชฯ)</p>\r\n\\n<p class=\"QN2lPu\">เก็บแต้มอัพคะแนนเพิ่มแน่ แค่มีเล่มนี้ 📌📌📌</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบแม่นยำ</p>\r\n\\n<p class=\"QN2lPu\">✔ครบถ้วนตามโครงสร้างข้อสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบสายแพทย์แน่นๆ</p>\r\n\\n<p class=\"QN2lPu\">✔สรุปเนื้อหา จุดออกบ่อย เฉลยละเอียดในเล่มทุกข้อ</p>\r\n\\n<p class=\"QN2lPu\">✔สำหรับสอบเข้าคณะในสายแพทย์ หรือทุกคณะ ทุกสาขา</p>\r\n\\n<p class=\"QN2lPu\">✔เขียนโดยทีมสุดยอดติวเตอร์คุณภาพจากรั้วจุฬาฯ มหิดล</p>\r\n\\n<p class=\"QN2lPu\">ในเล่ม มีครบ 8 วิชาที่สายแพทย์ต้องใช้สอบ</p>\r\n\\n<p class=\"QN2lPu\">✅TPAT1 ความถนัดแพทย์ กสพท</p>\r\n\\n<p class=\"QN2lPu\">✅A-Level คณิตศาสตร์ประยุกต์1</p>\r\n\\n<p class=\"QN2lPu\">✅A-Level ฟิสิกส์</p>\r\n\\n<p class=\"QN2lPu\">✅A-Level เคมี</p>\r\n\\n<p class=\"QN2lPu\">✅A-Level ชีววิทยา</p>\r\n\\n<p class=\"QN2lPu\">✅A-Level ภาษาอังกฤษ</p>\r\n\\n<p class=\"QN2lPu\">✅A-Level ภาษาไทย</p>\r\n\\n<p class=\"QN2lPu\">✅A-Level สังคมศึกษา</p>\r\n\\n<p class=\"QN2lPu\">💯เล่มเดียวจบ ครบทุกวิชาที่ใช้สอบสายแพทย์ ครบทุกหัวข้อตามโครงสร้างข้อสอบจริง Test Blueprint เกณฑ์ใหม่ล่าสุด</p>\r\n\\n<p class=\"QN2lPu\">ปกติราคา 1,990 บาท</p>\r\n\\n<p class=\"QN2lPu\">ด่วน!! โปรเปิดตัว รับราคาพิเศษ เฉพาะ 100 เล่มแรก ราคาเล่มละ 690 บาท</p>\r\n\\n<p class=\"QN2lPu\">👉สำหรับโรงเรียนหรือคุณครู ที่สนใจสั่งซื้อหนังสือจำนวนมาก สามารถสอบถามหรือสั่งซื้อเพื่อรับราคาพิเศษได้เลยนะครับ</p>\r\n\\n<p class=\"QN2lPu\">#เตรียมสอบแพทย์ #เตรียมสอบสายวิทย์สุขภาพ #หนังสือเตรียมสอบ #ข้อสอบPat1 #เทคนิคการแพทย์ #เภสัชศาสตร์ #วิทยาศาสตร์ #เฉลยข้อสอบ #ข้อสอบ7วิชาสามัญ #7วิชาสามัญ #เตรียมสอบมปลาย #TCAS68 #TCAS69 #TCAS70 #TCAS71 #สอบวิทยาศาสตร์สายสุขภาพ #วิทยาศาสตร์สายสุขภาพ #เตรียมสอบสัตวแพทย์ #เตรียมสอบเภสัชศาสตร์ #เตรียมสอบสหเวชศาสตร์ #เตรียมสอบเทคนิคการแพทย์ #เตรียมสอบพยาบาลศาสตร์ #เตรียมสอบสาธารณสุขศาสตร์</p>\r\n\\n<p class=\"QN2lPu\">#หนังสือเตรียมสอบ #หนังสือสรุปมปลาย #หนังสือสรุปเนื้อหาทุกวิชา #สรุปTCAS #สรุปชีวะ #สรุปคณิต #สรุปเคมี #สรุปฟิสิกส์ #สรุปภาษาไทย #สรุปภาษาอังกฤษ #สรุปสังคม #เตรียมสอบมปลาย #รวมเนื้อหามปลาย #ติวสอบ #เข้ามหาลัย #TCAS69 #TCAS70 #TCAS71 #A-level #DEK69 #DEK70 #DEK71 #JKNOWLEDGE #TGAT #TPAT #TPAT3 #A-level #TCASเกณฑ์ใหม่</p>', '[\"Med\", \"TCAS\"]', 690.00, 1990.00, 0, 0, NULL, NULL, 0, 1, '2026-02-02 22:49:49.475', '2026-02-02 22:49:49.475'),
(589, 'book-589', 'หนังสือ NETSAT สายวิทยาศาสตร์สุขภาพ + คอร์สติวเฉลยข้อสอบ 20 ชม.', 'book', 'เตรียมความพร้อมสู่สายแพทย์ มหาวิทยาลัยขอนแก่น (แพทย์ ทันตะ เภสัช สัตวแพทย์ เทคนิคการแพทย์) โค้งสุดท้ายกับหนังสือ \"NETSAT สายวิทยาศาสตร์สุขภาพ\"', '<p class=\"QN2lPu\">👨‍⚕เตรียมความพร้อมสู่สายแพทย์ มหาวิทยาลัยขอนแก่น (แพทย์ ทันตะ เภสัช สัตวแพทย์ เทคนิคการแพทย์)</p>\r\n\\n<p class=\"QN2lPu\">โค้งสุดท้ายกับหนังสือ \"NETSAT สายวิทยาศาสตร์สุขภาพ\"</p>\r\n\\n<p class=\"QN2lPu\">👨‍⚕หนังสือ NETSAT สายวิทยาศาสตร์สุขภาพ พร้อมคอร์สติวเฉลยข้อสอบ กว่า 20 ชั่วโมง</p>\r\n\\n<p class=\"QN2lPu\">รวมครบทุกความฉลาดรู้ ที่ใช้สอบสายแพทย์ในมหาวิทยาลัยขอนแก่น</p>\r\n\\n<p class=\"QN2lPu\">✅SAT1 ความฉลาดรู้ทั่วไป ด้านคณิตศาสตร์</p>\r\n\\n<p class=\"QN2lPu\">✅SAT1 ความฉลาดรู้ทั่วไป ด้านภาษาไทย</p>\r\n\\n<p class=\"QN2lPu\">✅SAT1 ความฉลาดรู้ทั่วไป ด้านภาษาอังกฤษ</p>\r\n\\n<p class=\"QN2lPu\">✅SAT2 ความฉลาดเฉพาะด้านฟิสิกส์</p>\r\n\\n<p class=\"QN2lPu\">✅SAT2 ความฉลาดเฉพาะด้านเคมี</p>\r\n\\n<p class=\"QN2lPu\">✅SAT2 ความฉลาดเฉพาะด้านชีววิทยา</p>\r\n\\n<p class=\"QN2lPu\">✅SAT2 ความฉลาดเฉพาะด้านวิทยาศาสตร์ เทคโนโลยี</p>\r\n\\n<p class=\"QN2lPu\">👨‍⚕เตรียมความพร้อมสู่สายแพทย์ มข. (แพทย์ ทันตะ เภสัช สัตวแพทย์ เทคนิคการแพทย์)</p>\r\n\\n<p class=\"QN2lPu\">หนังสือเล่มนี้เหมาะสำหรับ ?</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.6 ที่อยากสอบติดมหาวิทยาลัยขอนแก่น (คณะแพทย์ ทันตะฯ เภสัชฯ สัตวแพทย์ เทคนิคการแพทย์) เก็บคะแนนเต็มทุกวิชา เจาะลึกเข้มข้นกับวิชาสายแพทย์ และเตรียมพร้อมโค้งสุดท้ายก่อนสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.5 ที่อยากเตรียมความพร้อมตั้งแต่ตอนนี้ มาเจาะข้อสอบจากโจทย์ เรียงจากข้อง่าย ไปถึงข้อยาก พร้อมเทคนิคคิดลัด ตัดช้อย</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.4 ที่มีความฝันและเป็นเป้าหมายในการเรียนสายแพทย์ มข. ต้องการปูพื้นฐาน และพร้อมเตรียมสอบก่อนใคร เพราะเรารวมทุกวิชาที่ใช้สอบให้แล้วในเล่มนี้</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้อง ๆ ทุกระดับชั้น ทุกแผนการเรียน ที่อยากได้แนวข้อสอบเสมือนจริง เพราะเล่มนี้รวมทุกวิชาที่ใช้สอบไว้ให้แล้ว</p>\r\n\\n<p class=\"QN2lPu\">เก็บแต้มอัพคะแนนเพิ่มแน่ แค่มีเล่มนี้ 📌📌📌</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบแม่นยำ</p>\r\n\\n<p class=\"QN2lPu\">✔ครบทุกความฉลาดรู้ทั้ง SAT1 และ SAT2</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบเนื้อหาแน่นๆ กว่า 250 ข้อ</p>\r\n\\n<p class=\"QN2lPu\">✔เฉลยละเอียดในเล่มกว่า 250 ข้อ</p>\r\n\\n<p class=\"QN2lPu\">✔สำหรับสอบเข้าคณะในสายแพทย์ มหาวิทยาลัยขอนแก่น (แพทย์ ทันตะ เภสัช สัตวแพทย์ เทคนิคการแพทย์)</p>\r\n\\n<p class=\"QN2lPu\">✔เขียนโดยทีมสุดยอดติวเตอร์คุณภาพ</p>\r\n\\n<p class=\"QN2lPu\">💯เล่มเดียวจบ ครบทุกความฉลาดรู้ ที่ใช้สอบสายแพทย์ มข. ครบทุกหัวข้อตามโครงสร้างข้อสอบจริง และอัปเดตล่าสุด</p>\r\n\\n<p class=\"QN2lPu\">👉🏻สิ่งที่จะได้รับในหนังสือเล่มนี้</p>\r\n\\n<p class=\"QN2lPu\">✅ได้แนวข้อสอบพร้อมเฉลยอย่างละเอียดที่แม่นยำ รวมกว่า 250 ข้อ ตามโครงสร้างข้อสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้เฉลยละเอียดในเล่มรวมกว่า 250 ข้อ พร้อมเทคนิค คิดลัด ตัดช้อย</p>\r\n\\n<p class=\"QN2lPu\">✅ได้คอร์สติวเฉลยละเอียดทุกข้อ กว่า 21 ชม. (มูลค่า 2990 บาท)</p>\r\n\\n<p class=\"QN2lPu\">✅ได้คอร์สเตรียมติดมหาวิทยาลัยทุกรอบ ทุกคณะ กว่า 10 ชั่วโมง (มูลค่า 1990 บาท)</p>\r\n\\n<p class=\"QN2lPu\">✅ได้คอร์สวางแผนพิชิตคะแนนสอบสายแพทย์ มข. กว่า 50 คลิป (มูลค่า 1990 บาท)</p>\r\n\\n<p class=\"QN2lPu\">✅ได้กระดาษคำตอบ ได้ทดสอบเสมือนจริง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ปฏิทินการสอบ พิชิต TCAS เกณฑ์ใหม่ล่าสุด</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ตารางการอ่านหนังสือ แพลนเนอร์ชีวิตเพื่อเก็บเนื้อหาให้ครบ</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ตารางตั้งเป้าหมายชีวิตให้ได้ผลลัพธ์ที่ดีที่สุด</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ Study Plan ปฏิทินวางแผนการเรียน</p>\r\n\\n<p class=\"QN2lPu\">✅ได้เทคนิคจากรุ่นพี่สายแพทย์ มข.ตัวจริง ที่สอบได้คะแนนสูง (แพทย์ ทันตะ เภสัช สัตวแพทย์ เทคนิคการแพทย์ )</p>\r\n\\n<p class=\"QN2lPu\">✅ได้รีวิวการเรียนจากพี่ๆสายแพทย์ มข. (แพทย์ ทันตะ เภสัช สัตวแพทย์ เทคนิคการแพทย์ )</p>\r\n\\n<p class=\"QN2lPu\">✅เทคนิคการทำข้อสอบทุกพาร์ท เพื่อความรวดเร็วให้ทันเวลาสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">หนังสือ NETSAT สายวิทยาศาสตร์สุขภาพ (แพทย์ ทันตะแพทย์ สัตวแพทย์ เภสัช เทคนิคการแพทย์) พร้อมคอร์สติวเฉลยข้อสอบ กว่า 20 ชั่วโมง</p>\r\n\\n<p class=\"QN2lPu\">ฟรี!! ค่าจัดส่งทั่วประเทศ</p>\r\n\\n<p class=\"QN2lPu\">ฟรี!! คอร์สเตรียมติดมหาวิทยาลัยทุกรอบ ทุกคณะ กว่า 10 ชั่วโมง (มูลค่า 1990 บาท)</p>\r\n\\n<p class=\"QN2lPu\">ฟรี!! คอร์สวางแผนพิชิตคะแนนสอบสายแพทย์ มข. กว่า 50 คลิป (มูลค่า 1990 บาท)</p>\r\n\\n<p class=\"QN2lPu\">👉สำหรับโรงเรียนหรือคุณครู ที่สนใจสั่งซื้อหนังสือจำนวนมาก สามารถสอบถามหรือสั่งซื้อเพื่อรับราคาพิเศษได้เลยนะครับ</p>\r\n\\n<p class=\"QN2lPu\">#เตรียมสอบแพทย์ #เตรียมสอบสายวิทย์สุขภาพ #หนังสือเตรียมสอบ #ข้อสอบTPat1 #เทคนิคการแพทย์ #เภสัชศาสตร์ #วิทยาศาสตร์ #เฉลยข้อสอบ #เตรียมสอบมปลาย #สอบวิทยาศาสตร์สายสุขภาพ #วิทยาศาสตร์สายสุขภาพ #เตรียมสอบสัตวแพทย์ #เตรียมสอบเภสัชศาสตร์ #เตรียมสอบสหเวชศาสตร์ #เตรียมสอบเทคนิคการแพทย์ #เตรียมสอบพยาบาลศาสตร์ #เตรียมสอบสาธารณสุขศาสตร์</p>\r\n\\n<p class=\"QN2lPu\">#แนวข้อสอบชีวะ #แนวข้อสอบคณิต #แนวข้อสอบเคมี #แนวข้อสอบฟิสิกส์ #แนวข้อสอบภาษาไทย #แนวข้อสอบภาษาอังกฤษ #แนวข้อสอบสังคม #เตรียมสอบมปลาย #ติวสอบ #เข้ามหาลัย #TCAS69 #TCAS70 #TCAS71 #A-level #DEK69 #DEK70 #DEK71 #JKNOWLEDGE #TPAT3 #Netsat #Netsatมข #Netsat68 #Netsat69 #Netsat70</p>', '[\"Med\", \"Netsat\"]', 490.00, 1790.00, 0, 0, NULL, NULL, 0, 1, '2026-02-02 22:49:49.475', '2026-02-02 22:49:49.475'),
(596, 'book-596', 'หนังสือ NETSAT สายวิศวะ + คอร์สติวเฉลยละเอียด 20 ชั่วโมง', 'book', 'เตรียมความพร้อมสู่สายวิศวะ มหาวิทยาลัยขอนแก่น โค้งสุดท้ายกับหนังสือ \"NETSAT สายวิศวะฯ\"', '<p class=\"QN2lPu\">⚙️เตรียมความพร้อมสู่สายวิศวะ มหาวิทยาลัยขอนแก่น โค้งสุดท้ายกับหนังสือ \"NETSAT สายวิศวะฯ\"</p>\r\n\\n<p class=\"QN2lPu\">⚙️หนังสือ NETSAT สายวิศวะ พร้อมคอร์สติวเฉลยข้อสอบ กว่า 20 ชั่วโมง</p>\r\n\\n<p class=\"QN2lPu\">รวมครบทุกความฉลาดรู้ ที่ใช้สอบสายวิศวะในมหาวิทยาลัยขอนแก่น</p>\r\n\\n<p class=\"QN2lPu\">✅SAT1 ความฉลาดรู้ทั่วไป ด้านคณิตศาสตร์</p>\r\n\\n<p class=\"QN2lPu\">✅SAT1 ความฉลาดรู้ทั่วไป ด้านภาษาอังกฤษ</p>\r\n\\n<p class=\"QN2lPu\">✅SAT2 ความฉลาดเฉพาะด้านฟิสิกส์</p>\r\n\\n<p class=\"QN2lPu\">✅SAT2 ความฉลาดเฉพาะด้านเคมี</p>\r\n\\n<p class=\"QN2lPu\">✅วิชา TPAT3 ข้อสอบวัดความถนัดด้านวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์</p>\r\n\\n<p class=\"QN2lPu\">⚙️เตรียมความพร้อมสู่สายวิศวะ มข.</p>\r\n\\n<p class=\"QN2lPu\">หนังสือเล่มนี้เหมาะสำหรับ ?</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.6 ที่อยากสอบติดคณะวิศวะฯ มหาวิทยาลัยขอนแก่น เก็บคะแนนเต็มทุกวิชา เจาะลึกเข้มข้นกับวิชาสายวิศวะ และเตรียมพร้อมโค้งสุดท้ายก่อนสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.5 ที่อยากเตรียมความพร้อมตั้งแต่ตอนนี้ มาเจาะข้อสอบจากโจทย์ เรียงจากข้อง่าย ไปถึงข้อยาก พร้อมเทคนิคคิดลัด ตัดช้อย</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.4 ที่มีความฝันและเป็นเป้าหมายในการเรียนสายวิศวะฯ มข. ต้องการปูพื้นฐาน และพร้อมเตรียมสอบก่อนใคร เพราะเรารวมทุกวิชาที่ใช้สอบให้แล้วในเล่มนี้</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้อง ๆ ทุกระดับชั้น ทุกแผนการเรียน ที่อยากได้แนวข้อสอบเสมือนจริง เพราะเล่มนี้รวมทุกวิชาที่ใช้สอบไว้ให้แล้ว</p>\r\n\\n<p class=\"QN2lPu\">เก็บแต้มอัพคะแนนเพิ่มแน่ แค่มีเล่มนี้ 📌📌📌</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบแม่นยำ</p>\r\n\\n<p class=\"QN2lPu\">✔ครบทุกความฉลาดรู้ทั้ง SAT1 และ SAT2</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบเนื้อหาแน่นๆ กว่า 200 ข้อ</p>\r\n\\n<p class=\"QN2lPu\">✔เฉลยละเอียดในเล่มกว่า 200 ข้อ</p>\r\n\\n<p class=\"QN2lPu\">✔สำหรับสอบเข้าคณะวิศวะฯ มหาวิทยาลัยขอนแก่น</p>\r\n\\n<p class=\"QN2lPu\">✔เขียนโดยทีมสุดยอดติวเตอร์คุณภาพ</p>\r\n\\n<p class=\"QN2lPu\">💯เล่มเดียวจบ ครบทุกความฉลาดรู้ ที่ใช้สอบสายวิศวะฯ มข. ครบทุกหัวข้อตามโครงสร้างข้อสอบจริง และอัปเดตล่าสุด</p>\r\n\\n<p class=\"QN2lPu\">👉🏻สิ่งที่จะได้รับในหนังสือเล่มนี้</p>\r\n\\n<p class=\"QN2lPu\">✅ได้แนวข้อสอบพร้อมเฉลยอย่างละเอียดที่แม่นยำ รวมกว่า 200 ข้อ ตามโครงสร้างข้อสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้เฉลยละเอียดในเล่มรวมกว่า 200 ข้อ พร้อมเทคนิค คิดลัด ตัดช้อย</p>\r\n\\n<p class=\"QN2lPu\">✅ได้คอร์สติวเฉลยละเอียดทุกข้อ กว่า 20 ชม. (มูลค่า 2990 บาท)</p>\r\n\\n<p class=\"QN2lPu\">✅ได้คอร์สเตรียมติดมหาวิทยาลัยทุกรอบ ทุกคณะ กว่า 10 ชั่วโมง (มูลค่า 1990 บาท)</p>\r\n\\n<p class=\"QN2lPu\">✅ได้คอร์สวางแผนพิชิตคะแนนสอบสายวิศวะ มข. กว่า 50 คลิป (มูลค่า 1990 บาท)</p>\r\n\\n<p class=\"QN2lPu\">✅ได้กระดาษคำตอบ ได้ทดสอบเสมือนจริง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ปฏิทินการสอบ พิชิต TCAS เกณฑ์ใหม่ล่าสุด</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ตารางการอ่านหนังสือ แพลนเนอร์ชีวิตเพื่อเก็บเนื้อหาให้ครบ</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ตารางตั้งเป้าหมายชีวิตให้ได้ผลลัพธ์ที่ดีที่สุด</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ Study Plan ปฏิทินวางแผนการเรียน</p>\r\n\\n<p class=\"QN2lPu\">✅ได้เทคนิคจากรุ่นพี่สายวิศวะฯ มข.ตัวจริง ที่สอบได้คะแนนสูง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้รีวิวการเรียนจากพี่ๆสายวิศวะฯ มข.</p>\r\n\\n<p class=\"QN2lPu\">✅เทคนิคการทำข้อสอบทุกพาร์ท เพื่อความรวดเร็วให้ทันเวลาสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">หนังสือ NETSAT สายวิศวะฯ พร้อมคอร์สติวเฉลยข้อสอบ กว่า 20 ชั่วโมง</p>\r\n\\n<p class=\"QN2lPu\">ฟรี!! ค่าจัดส่งทั่วประเทศ</p>\r\n\\n<p class=\"QN2lPu\">ฟรี!! คอร์สเตรียมติดมหาวิทยาลัยทุกรอบ ทุกคณะ กว่า 10 ชั่วโมง (มูลค่า 1990 บาท)</p>\r\n\\n<p class=\"QN2lPu\">ฟรี!! คอร์สวางแผนพิชิตคะแนนสอบสายวิศวะฯ มข. กว่า 50 คลิป (มูลค่า 1990 บาท)</p>\r\n\\n<p class=\"QN2lPu\">👉สำหรับโรงเรียนหรือคุณครู ที่สนใจสั่งซื้อหนังสือจำนวนมาก สามารถสอบถามหรือสั่งซื้อเพื่อรับราคาพิเศษได้เลยนะครับ</p>\r\n\\n<p class=\"QN2lPu\"># หนังสือเตรียมสอบวิศวกรรมศาสตร์มข รวมข้อสอบจริงและเฉลย ฟรี! คอรสติวเตรียมสอบความถนัดวิศวะ TPAT 3 กว่า 10 ชั่วโมง</p>\r\n\\n<p class=\"QN2lPu\">#เตรียมสอบวิศวกรรมศาสตร์ #เตรียมสอบวิศวะมข #หนังสือเตรียมสอบ #ข้อสอบTPAT 3 #เฉลยข้อสอบ</p>\r\n\\n<p class=\"QN2lPu\">#หนังสือเตรียมสอบ มข #หนังสือสรุปเนื้อหาทุกวิชา #สรุปTCAS #สรุปคณิต #สรุปเคมี #สรุปฟิสิกส์ #สรุปภาษาไทย #สรุปภาษาอังกฤษ #สรุปสังคม #เตรียมสอบมปลาย #รวมเนื้อหามปลาย #ติวสอบ #เข้ามหาลัย #TCAS69 #TCAS70 #TCAS71 #A-level #DEK69 #DEK70 #DEK71 #JKNOWLEDGE #TPAT3 #Netsat #Netsatมข #Netsat68 #Netsat69 #Netsat70</p>', '[\"En\", \"Netsat\"]', 490.00, 1390.00, 0, 0, NULL, NULL, 0, 1, '2026-02-02 22:49:49.475', '2026-02-02 22:49:49.475'),
(632, 'book-632', 'หนังสือเตรียมสอบ ท้องถิ่น 68 พร้อม คอร์สติว สอบ ท้องถิ่น 35 ชม. J ก.พ. tutor', 'book', '<p class=\"QN2lPu\">หนังสือติวและเฉลยข้อสอบจริง ท้องถิ่น 68 ฟรี คอร์สติวเฉลย 35 ชม. เกณฑ์ใหม่ตามโครงสร้าง ม.บูรพาผู้ออกข้อสอบ ใช้ภาษาที่เข้าใจง่าย 📌📌 สามารถไปประยุกต์ใช้ได้จริง ✅ เล่มเดียวจบ พร้อมบรรจุ</p>', '<p class=\"QN2lPu\">หนังสือติวและเฉลยข้อสอบจริง ท้องถิ่น 68 ฟรี คอร์สติวเฉลย 35 ชม. เกณฑ์ใหม่ตามโครงสร้าง ม.บูรพาผู้ออกข้อสอบ ใช้ภาษาที่เข้าใจง่าย 📌📌สามารถไปประยุกต์ใช้ได้จริง ✅ เล่มเดียวจบ พร้อมบรรจุ 💯</p>\r\n\\n<p class=\"QN2lPu\">📌สิ่งที่จะได้รับ📌</p>\r\n\\n<p class=\"QN2lPu\">1. หนังสือติวและเฉลยข้อสอบปีล่าสุด ทั้ง 4 วิชา</p>\r\n\\n<p class=\"QN2lPu\">2. เฉลยข้อสอบจริง แบบละเอียดทั้ง 4 วิชา</p>\r\n\\n<p class=\"QN2lPu\">✅ แถมฟรี ! ! คอร์สติวและเฉลยข้อสอบจริงปีล่าสุด 35 ชม.เต็ม ครบทั้ง 4 วิชา</p>\r\n\\n<p class=\"QN2lPu\">✅ แถมฟรี !! ไฟล์ รวม พ.ร.บ. 13 ฉบับ ที่ใช้สอบวิชาความรู้พื้นฐานข้าราชการ</p>\r\n\\n<p class=\"QN2lPu\">💙 เนื้อหาข้อสอบในหนังสือ ครบทั้ง 4 วิชา💙</p>\r\n\\n<p class=\"QN2lPu\">✔️ ความรู้ความสามารถทั่วไป คณิตศาสตร์</p>\r\n\\n<p class=\"QN2lPu\">- อนุกรม</p>\r\n\\n<p class=\"QN2lPu\">- โอเปอร์เรชั่น</p>\r\n\\n<p class=\"QN2lPu\">- คณิตศาสตร์ทั่วไป</p>\r\n\\n<p class=\"QN2lPu\">- โจทย์วิเคราะห์ตาราง</p>\r\n\\n<p class=\"QN2lPu\">- สรุปความจากภาษา</p>\r\n\\n<p class=\"QN2lPu\">- เงื่อนไขสัญลักษณ์</p>\r\n\\n<p class=\"QN2lPu\">- การสรุปความจากสัญลักษณ์</p>\r\n\\n<p class=\"QN2lPu\">- ข้อสอบจริงและเฉลยแบบละเอียด</p>\r\n\\n<p class=\"QN2lPu\">✔️ ภาษาไทย</p>\r\n\\n<p class=\"QN2lPu\">- อุปมาอุปไมย</p>\r\n\\n<p class=\"QN2lPu\">- เงื่อนไขทางภาษา</p>\r\n\\n<p class=\"QN2lPu\">- การเรียงประโยค</p>\r\n\\n<p class=\"QN2lPu\">- การใช้ภาษา</p>\r\n\\n<p class=\"QN2lPu\">- การอ่านบทความ บทความสั้น /บทความยาว</p>\r\n\\n<p class=\"QN2lPu\">- ข้อสอบจริงและเฉลยแบบละเอียด</p>\r\n\\n<p class=\"QN2lPu\">✔️ ภาษาอังกฤษ</p>\r\n\\n<p class=\"QN2lPu\">- บทสนทนา</p>\r\n\\n<p class=\"QN2lPu\">- คำศัพท์</p>\r\n\\n<p class=\"QN2lPu\">- บทความ</p>\r\n\\n<p class=\"QN2lPu\">- ไวยากรณ์</p>\r\n\\n<p class=\"QN2lPu\">- ข้อสอบจริงและเฉลยแบบละเอียด</p>\r\n\\n<p class=\"QN2lPu\">✔️ ความรู้พื้นฐานในการปฏิบัติราชการ ทั้ง 11 ฉบับ</p>\r\n\\n<p class=\"QN2lPu\">- รัฐธรรมนูญแห่งราชอาณาจักรไทย พ.ศ. 2560</p>\r\n\\n<p class=\"QN2lPu\">- พระราชบัญญัติระเบียบบริหารราชการแผ่นดิน พ.ศ. 2534 และแก้ไขเพิ่มเติม</p>\r\n\\n<p class=\"QN2lPu\">- พระราชบัญญัติองค์การบริหารส่วนจังหวัดพ.ศ. 2540 และที่แก้ไขเพิ่มเติม</p>\r\n\\n<p class=\"QN2lPu\">- พระราชบัญญัติเทศบาลพ.ศ. 2496 และที่แก้ไขเพิ่มเติม</p>\r\n\\n<p class=\"QN2lPu\">- พระราชบัญญัติสภาตำบลและองค์การบริหารส่วนตำบลพ.ศ. 2537 และที่แก้ไขเพิ่มเติม</p>\r\n\\n<p class=\"QN2lPu\">- พระราชบัญญัติระเบียบบริหารราชการเมืองพัทยาพ.ศ. 2542 และที่แก้ไขเพิ่มเติม</p>\r\n\\n<p class=\"QN2lPu\">- พระราชบัญญัติกำหนดแผนและขั้นตอนการกระจายอำนาจให้แก่องค์กรปกครองส่วนท้องถิ่นพ.ศ. 2542 และที่แก้ไขเพิ่มเติม</p>\r\n\\n<p class=\"QN2lPu\">- พระราชบัญญัติระเบียบบริหารงานบุคคลส่วนท้องถิ่นพ.ศ. 2542</p>\r\n\\n<p class=\"QN2lPu\">- พระราชกฤษฎีกาว่าด้วยหลักเกณฑ์และวิธีการบริหาร กิจการบ้านเมืองที่ดีพ.ศ. 2546</p>\r\n\\n<p class=\"QN2lPu\">- พระราชบัญญัติการอำนวยความสะดวกในการพิจารณาอนุญาตของทางราชการพ.ศ. 2558</p>\r\n\\n<p class=\"QN2lPu\">- ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบัญพ.ศ. 2526 และที่แก้ไขเพิ่มเติม</p>\r\n\\n<p class=\"QN2lPu\">#ท้องถิ่น68 #สอบท้องถิ่น68 #เตรียมสอบกพ68 #สอบกพ68</p>\r\n\\n<p class=\"QN2lPu\">#เตรียมสอบท้องถิ่น #สอบท้องถิ่น #สอบข้าราชการ #เตรียมสอบข้าราชการ #สอบท้องถิ่น #ข้อสอบท้องถิ่น #หนังสือติวสอบกพ #หนังสือเตรียมสอบกพ</p>', '[\"local\"]', 490.00, 1990.00, 0, 0, NULL, NULL, 0, 1, '2026-02-02 22:49:49.475', '2026-02-02 22:49:49.475'),
(722, 'book-722', 'หนังสือเตรียมสอบวิศวะ วิทยาศาสตร์ เทคโนโลยี + คอร์สติวเฉลยอย่างละเอียด 28 ชม.', 'book', 'น้องม.4-ม.6 ที่อยากติดคณะในสายวิศวะ วิทยาศาสตร์ เทคโนโลยี ห้ามพลาดกับเล่มนี้ เล่มเดียวจบ ครบทุกวิชาที่ใช้สอบวิศวะ ฟรี คอร์สเฉลยข้อสอบอย่างละเอียด กว่า 28 ชั่วโมง', '<p class=\"QN2lPu\">น้องม.4-ม.6 ที่อยากติดคณะในสายวิศวะ วิทยาศาสตร์ เทคโนโลยี ห้ามพลาดกับเล่มนี้ เล่มเดียวจบ ครบทุกวิชาที่ใช้สอบวิศวะ ฟรี คอร์สเฉลยข้อสอบอย่างละเอียด กว่า 28 ชั่วโมง</p>\r\n\\n<p class=\"QN2lPu\">👨‍⚕หนังสือเตรียมสอบวิศวะ มหาวิทยาลัยชั้นนำ + คอร์สติวเฉลยข้อสอบ กว่า 28 ชั่วโมง</p>\r\n\\n<p class=\"QN2lPu\">เตรียมความพร้อมสู่สายวิศวะ วิทยาศาสตร์ เทคโนโลยี)</p>\r\n\\n<p class=\"QN2lPu\">เก็บแต้มอัพคะแนนเพิ่มแน่ แค่มีเล่มนี้ 📌📌📌</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบแม่นยำ</p>\r\n\\n<p class=\"QN2lPu\">✔ครบถ้วนตามโครงสร้างข้อสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบที่ใช้สอบในคณะวิศวะแน่นๆ</p>\r\n\\n<p class=\"QN2lPu\">✔สรุปเนื้อหา จุดออกบ่อย เฉลยละเอียดในเล่มทุกข้อ</p>\r\n\\n<p class=\"QN2lPu\">✔สำหรับสอบเข้าคณะวิศวะ วิทยาศาสตร์ เทคโนโลยี ทุกสาขา</p>\r\n\\n<p class=\"QN2lPu\">✔เขียนโดยทีมสุดยอดติวเตอร์คุณภาพจากรั้วจุฬาฯ มหิดล</p>\r\n\\n<p class=\"QN2lPu\">ในเล่ม มีครบ ที่คณะวิศวะต้องใช้สอบ</p>\r\n\\n<p class=\"QN2lPu\">✅TPAT3 ความถนัดด้านวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์</p>\r\n\\n<p class=\"QN2lPu\">✅A-Level คณิตศาสตร์ประยุกต์</p>\r\n\\n<p class=\"QN2lPu\">✅A-Level ฟิสิกส์</p>\r\n\\n<p class=\"QN2lPu\">✅A-Level เคมี</p>\r\n\\n<p class=\"QN2lPu\">✅A-Level ภาษาอังกฤษ</p>\r\n\\n<p class=\"QN2lPu\">💯เล่มเดียวจบ ครบทุกวิชาที่ใช้สอบ ครบทุกหัวข้อตามโครงสร้างข้อสอบจริง Test Blueprint เกณฑ์ใหม่ล่าสุด</p>\r\n\\n<p class=\"QN2lPu\">ปกติราคา 1,390 บาท</p>\r\n\\n<p class=\"QN2lPu\">ด่วน!! โปรเปิดตัว รับราคาพิเศษ เฉพาะ 100 เล่มแรก ราคาเล่มละ 490 บาท</p>\r\n\\n<p class=\"QN2lPu\">👉สำหรับโรงเรียนหรือคุณครู ที่สนใจสั่งซื้อหนังสือจำนวนมาก สามารถสอบถามหรือสั่งซื้อเพื่อรับราคาพิเศษได้เลยนะครับ</p>\r\n\\n<p class=\"QN2lPu\"># หนังสือเตรียมสอบวิศวกรรมศาสตร์ รวมข้อสอบจริงและเฉลย ฟรี! คอรสติวเตรียมสอบความถนัดวิศวะ TPAT 3 กว่า 28 ชั่วโมง</p>\r\n\\n<p class=\"QN2lPu\">#เตรียมสอบวิศวกรรมศาสตร์ #เตรียมสอบวิศวะ #หนังสือเตรียมสอบ #ข้อสอบTPat3 #หนังสือเตรียมสอบ #หนังสือสรุปมปลาย #หนังสือสรุปเนื้อหาทุกวิชา #สรุปคณิต #สรุปเคมี #สรุปฟิสิกส์ #สรุปภาษาอังกฤษ #เตรียมสอบมปลาย #รวมเนื้อหามปลาย #ติวสอบ #เข้ามหาลัย #TCAS69 #TCAS70 #TCAS71 #A-level #DEK69 #DEK70 #DEK71 #JKNOWLEDGE #TGAT #TPAT #TPAT3 #A-level #TCASเกณฑ์ใหม่</p>', '[\"En\", \"TCAS\"]', 490.00, 1390.00, 0, 0, NULL, NULL, 0, 1, '2026-02-02 22:49:49.475', '2026-02-02 22:49:49.475'),
(730, 'book-730', 'หนังสือเตรียมสอบ TGAT ENG พิชิต TCAS68-69 เกณฑ์ใหม่ สสวท. ฟรี ! คอร์สติว 20 ชม.', 'book', 'เตรียมตัวสอบได้อย่างมั่นใจ มาพิชิต TGAT ENG เก็บแต้มคะแนนสอบครบทุกเรื่อง กับ หนังสือเตรียมสอบ TGAT ENG สรุปเนื้อหา และข้อสอบเสมือนจริงตามโครงสร้างข้อสอบจริง (Test blueprint) ครบจบทุกเรื่อง รวมไว้ให้แล้วในเล่มเดียว พร้อมคอร์สเฉลยข้อสอบละเอียดทุกข้อกว่า 20 ชม.', 'เล่มนี้เหมาะสำหรับใคร?\r\n\\n👉สำหรับน้อง ม.4 ม.5 ม.6 ที่อยากฝึกทำข้อสอบเสมือนจริง เตรียมพร้อมโค้งสุดท้ายก่อนเจอสนามสอบจริง\r\n\\n👉สำหรับน้อง ม.4 ม.5 ม.6 ที่อยากมีตัวช่วยทำให้คะแนนมีคะแนนสอบที่ดี เก็บแต้มอัพคะแนนเพิ่มแน่ แค่มีเล่มนี้\r\n\\n📌📌📌 ✔แนวข้อสอบแม่นยำ ✔ครบถ้วนตามโครงสร้างข้อสอบจริง ✔แนวข้อสอบ TGAT ENG แน่นๆ ✔สรุปเนื้อหา จุดออกบ่อย เฉลยละเอียดในเล่มทุกข้อ ✔สำหรับสอบเข้าทุกคณะ ทุกสาขา ✔เขียนโดยทีมสุดยอดติวเตอร์คุณภาพจากรั้วจุฬาฯ มหิดล\r\n\\n💥ฟรี!! คอร์สสรุปเนื้อหา เฉลยข้อสอบละเอียดทุกข้อ 20 ชม. หนังสือ เตรียมสอบ TGAT ENG พร้อมเฉลยละเอียด + คอร์สเฉลยข้อสอบ 20 ชม. เตรียมสอบ TGAT ENG ได้อย่างมั่นใจ เล่มเดียวจบครบทุกเรื่องที่ออกสอบ ตามแนวข้อสอบจริง (Test blueprint)', '[\"Eng\", \"TCAS\"]', 490.00, 1390.00, 0, 0, NULL, NULL, 0, 1, '2026-02-02 22:49:49.475', '2026-02-02 22:49:49.475'),
(733, 'book-733', 'หนังสือ เตรียมสอบพยาบาลพระบรม/พยาบาล 4 เหล่า (ตามแนว สสวท.) + ฟรีคอร์สเฉลย 25 ชม.', 'book', 'หนังสือเตรียมสอบพยาบาล (พยาบาลมหาวิทยาลัยชั้นนำ, พยาบาล 4 เหล่าทัพ, พยาบาลพระบรมฯ) + คอร์สติวเฉลยข้อสอบ กว่า 25 ชั่วโมง เตรียมความพร้อมสู่การสอบพยาบาล', '<p class=\"QN2lPu\">💉หนังสือเตรียมสอบพยาบาล (พยาบาลมหาวิทยาลัยชั้นนำ, พยาบาล 4 เหล่าทัพ, พยาบาลพระบรมฯ) + คอร์สติวเฉลยข้อสอบ กว่า 25 ชั่วโมง เตรียมความพร้อมสู่การสอบพยาบาล</p>\r\n\\n<p class=\"QN2lPu\">📘เก็บแต้มอัพคะแนนเพิ่มแน่ แค่มีเล่มนี้ 📌📌📌</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบแม่นยำ</p>\r\n\\n<p class=\"QN2lPu\">✔ครบถ้วนตามโครงสร้างข้อสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบพยาบาลแน่นๆ</p>\r\n\\n<p class=\"QN2lPu\">✔สรุปเนื้อหา จุดออกบ่อย เฉลยละเอียดในเล่มทุกข้อ</p>\r\n\\n<p class=\"QN2lPu\">✔สำหรับสอบสายพยาบาล ทุกมหาวิทยาลัยชั้นนำ, พยาบาล 4 เหล่าทัพ, และพยาบาลพระบรมฯ</p>\r\n\\n<p class=\"QN2lPu\">✔เขียนโดยทีมสุดยอดติวเตอร์คุณภาพประสบการณ์สอนกว่า 20 ปี</p>\r\n\\n<p class=\"QN2lPu\">ในเล่ม มีครบ 7 วิชาที่สายพยาบาลต้องใช้สอบ</p>\r\n\\n<p class=\"QN2lPu\">✅A-Level คณิตศาสตร์ประยุกต์1</p>\r\n\\n<p class=\"QN2lPu\">✅A-Level ฟิสิกส์</p>\r\n\\n<p class=\"QN2lPu\">✅A-Level เคมี</p>\r\n\\n<p class=\"QN2lPu\">✅A-Level ชีววิทยา</p>\r\n\\n<p class=\"QN2lPu\">✅A-Level ภาษาอังกฤษ</p>\r\n\\n<p class=\"QN2lPu\">✅A-Level ภาษาไทย</p>\r\n\\n<p class=\"QN2lPu\">✅A-Level สังคมศึกษา</p>\r\n\\n<p class=\"QN2lPu\">💯เล่มเดียวจบ ครบทุกวิชาที่ใช้สอบพยาบาล ครบทุกหัวข้อตามโครงสร้างข้อสอบจริง Test Blueprint เกณฑ์ใหม่ล่าสุด</p>\r\n\\n<p class=\"QN2lPu\">เก็บแต้มอัพคะแนน TCAS เพิ่มแน่ แค่มีเล่มนี้ 📌📌📌</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบแม่นยำ</p>\r\n\\n<p class=\"QN2lPu\">✔ครบถ้วนตามโครงสร้างข้อสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบแน่นๆ</p>\r\n\\n<p class=\"QN2lPu\">✔เฉลยละเอียดในเล่มทุกข้อ</p>\r\n\\n<p class=\"QN2lPu\">✔สำหรับสอบเข้าพยาบาลทุกสถาบันชั้นนำทั่วประเทศ</p>\r\n\\n<p class=\"QN2lPu\">✔เขียนโดยทีมสุดยอดติวเตอร์คุณภาพจากรั้วมหาวิทยาลัยชั้นนำของประเทศไทย</p>\r\n\\n<p class=\"QN2lPu\">💯เล่มเดียวจบ ครบทุกพาร์ที่ใช้สอบสายพยาบาล ครบทุกหัวข้อตามโครงสร้างข้อสอบจริง Test Blueprint เกณฑ์ใหม่ล่าสุด</p>\r\n\\n<p class=\"QN2lPu\">หนังสือเตรียมสอบสายพยาบาล + คอร์สติวเฉลยข้อสอบ กว่า 25 ชั่วโมง</p>\r\n\\n<p class=\"QN2lPu\">👉สำหรับโรงเรียนหรือคุณครู ที่สนใจสั่งซื้อหนังสือจำนวนมาก สามารถสอบถามหรือสั่งซื้อเพื่อรับราคาพิเศษได้เลยนะครับ</p>\r\n\\n<p class=\"QN2lPu\">#เตรียมสอบพยาบาล #เตรียมสอบพยาบาลสี่เหล่า #เตรียมสอบพยาบาลพระบรม #หนังสือเตรียมสอบ #หนังสือเตรียมสอบ #หนังสือสรุปมปลาย #เตรียมสอบมปลาย #ติวสอบ #เข้ามหาลัย #TCAS69 #TCAS70 #TCAS71 #A-level #DEK69 #DEK70 #DEK71 #JKNOWLEDGE #TGAT #TPAT #TPAT3 #A-level #TCASเกณฑ์ใหม่</p>', '[\"Alevel\", \"Nurse\"]', 490.00, 1390.00, 0, 0, NULL, NULL, 0, 1, '2026-02-02 22:49:49.475', '2026-02-02 22:49:49.475'),
(742, 'book-742', 'หนังสือ แนวข้อสอบเสมือนจริง ครู ครุศาสตร์ + คอร์สติวเฉลยข้อสอบ 25 ชม.', 'book', 'หนังสือเตรียมสอบสายครุศาสตร์-ศึกษาศาสตร์ + คอร์สติวเฉลยข้อสอบ กว่า 25 ชั่วโมง เตรียมความพร้อมสู่สายครู (ครุศาสตร์-ศึกษาศาสตร์)', '<p class=\"QN2lPu\">🧑‍🏫หนังสือเตรียมสอบสายครุศาสตร์-ศึกษาศาสตร์ + คอร์สติวเฉลยข้อสอบ กว่า 25 ชั่วโมง</p>\r\n\\n<p class=\"QN2lPu\">เตรียมความพร้อมสู่สายครู (ครุศาสตร์-ศึกษาศาสตร์)</p>\r\n\\n<p class=\"QN2lPu\">📙เก็บแต้มอัพคะแนนเพิ่มแน่ แค่มีเล่มนี้ 📌📌📌</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบแม่นยำ</p>\r\n\\n<p class=\"QN2lPu\">✔ครบถ้วนตามโครงสร้างข้อสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบสายครูแน่นๆ</p>\r\n\\n<p class=\"QN2lPu\">✔สรุปเนื้อหา จุดออกบ่อย เฉลยละเอียดในเล่มทุกข้อ</p>\r\n\\n<p class=\"QN2lPu\">✔สำหรับสอบสายครู ทุกสาขา ทุกมหาวิทยาลัยชั้นนำ</p>\r\n\\n<p class=\"QN2lPu\">✔เขียนโดยทีมสุดยอดติวเตอร์คุณภาพจากรั้วจุฬาฯ มหิดล มข.</p>\r\n\\n<p class=\"QN2lPu\">ในเล่ม มีครบ 5 วิชาที่สายครูต้องใช้สอบ</p>\r\n\\n<p class=\"QN2lPu\">✅TPAT5 ความถนัดครุศาสตร์-ศึกษาศาสตร์</p>\r\n\\n<p class=\"QN2lPu\">✅A-Level คณิตศาสตร์ประยุกต์1</p>\r\n\\n<p class=\"QN2lPu\">✅A-Level ภาษาอังกฤษ</p>\r\n\\n<p class=\"QN2lPu\">✅A-Level ภาษาไทย</p>\r\n\\n<p class=\"QN2lPu\">✅A-Level สังคมศึกษา</p>\r\n\\n<p class=\"QN2lPu\">💯เล่มเดียวจบ ครบทุกวิชาที่ใช้สอบครู ครบทุกหัวข้อตามโครงสร้างข้อสอบจริง Test Blueprint เกณฑ์ใหม่ล่าสุด</p>\r\n\\n<p class=\"QN2lPu\">เล่มนี้เหมาะสำหรับ ?</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.6 ที่อยากเรียนครู เตรียมพร้อมโค้งสุดท้ายก่อนสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.5 ที่อยากเตรียมความพร้อมตั้งแต่ตอนนี้ มาเจาะข้อสอบจากโจทย์ เรียงจากข้อง่าย ไปถึงข้อยาก</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.4 ที่มีความฝันและเป็นเป้าหมายในการเรียนครู ต้องการปูพื้นฐาน และพร้อมเตรียมสอบก่อนใคร เพราะเรารวมทุกวิชาที่ใช้สอบให้แล้วในเล่มนี้</p>\r\n\\n<p class=\"QN2lPu\">👉🏻 น้อง ๆ ทุกระดับชั้น ทุกแผนการเรียน ที่อยากได้แนวข้อสอบเสมือนจริง เพราะเล่มนี้รวมทุกวิชาที่ใช้สอบคณะครุศาสตร์-ศึกษาศาสตร์ ไว้ให้แล้ว</p>\r\n\\n<p class=\"QN2lPu\">👉🏻สิ่งที่จะได้รับในหนังสือเล่มนี้</p>\r\n\\n<p class=\"QN2lPu\">✅ได้แนวข้อสอบพร้อมเฉลยอย่างละเอียดที่แม่นยำ ตามโครงสร้าง Test Blueprint</p>\r\n\\n<p class=\"QN2lPu\">✅ได้เฉลยละเอียดในเล่มทุกข้อ พร้อมเทคนิค คิดลัด ตัดช้อย</p>\r\n\\n<p class=\"QN2lPu\">✅ได้คอร์สติวเฉลยละเอียดทุกข้อ กว่า 25 ชม.</p>\r\n\\n<p class=\"QN2lPu\">✅ได้กระดาษคำตอบ ได้ทดสอบเสมือนจริง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ปฏิทินการสอบ พิชิต TCAS เกณฑ์ใหม่ล่าสุด</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ตารางการอ่านหนังสือ แพลนเนอร์ชีวิตเพื่อเก็บเนื้อหาให้ครบ</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ตารางตั้งเป้าหมายชีวิตให้ได้ผลลัพธ์ที่ดีที่สุด</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ Study Plan ปฏิทินวางแผนการเรียน</p>\r\n\\n<p class=\"QN2lPu\">✅ได้เทคนิคจากรุ่นพี่ที่สอบติดครู ตัวจริง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้รีวิวการเรียนจากพี่ๆที่เรียนครูครบทุกมหาวิทยาลัยชั้นนำทั่วประเทศ</p>\r\n\\n<p class=\"QN2lPu\">เก็บแต้มอัพคะแนน TCAS เพิ่มแน่ แค่มีเล่มนี้ 📌📌📌</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบแม่นยำ</p>\r\n\\n<p class=\"QN2lPu\">✔ครบถ้วนตามโครงสร้างข้อสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบแน่นๆ</p>\r\n\\n<p class=\"QN2lPu\">✔เฉลยละเอียดในเล่มทุกข้อ</p>\r\n\\n<p class=\"QN2lPu\">✔สำหรับสอบเข้าคณะครุศาสตร์-ศึกษาศาสตร์ทุกมหาวิทยาลัยชั้นนำทั่วประเทศ</p>\r\n\\n<p class=\"QN2lPu\">✔เขียนโดยทีมสุดยอดติวเตอร์คุณภาพจากรั้วมหาวิทยาลัยชั้นนำของประเทศไทย</p>\r\n\\n<p class=\"QN2lPu\">💯เล่มเดียวจบ ครบทุกพาร์ที่ใช้สอบสายครู ครบทุกหัวข้อตามโครงสร้างข้อสอบจริง Test Blueprint เกณฑ์ใหม่ล่าสุด</p>\r\n\\n<p class=\"QN2lPu\">หนังสือเตรียมสอบสายครู(ครุศาสตร์-ศึกษาศาสตร์) + คอร์สติวเฉลยข้อสอบ กว่า 25 ชั่วโมง</p>\r\n\\n<p class=\"QN2lPu\">ฟรี!! ค่าจัดส่งทั่วประเทศ</p>\r\n\\n<p class=\"QN2lPu\">👉สำหรับโรงเรียนหรือคุณครู ที่สนใจสั่งซื้อหนังสือจำนวนมาก สามารถสอบถามหรือสั่งซื้อเพื่อรับราคาพิเศษได้เลยนะครับ</p>\r\n\\n<p class=\"QN2lPu\">#เตรียมสอบครู #หนังสือเตรียมสอบครู #หนังสือสรุปมปลาย #เตรียมสอบมปลาย #ติวสอบ #เข้ามหาลัย #TCAS69 #TCAS70 #TCAS71 #A-level #DEK69 #DEK70 #DEK71 #JKNOWLEDGE #TGAT #TPAT #A-level #TCASเกณฑ์ใหม่ #ศึกษาศาสตร์ #ครุศาสตร์ #TPAT5 #แนวข้อสอบคณิต #แนวข้อสอบอังกฤษ #แนวข้อสอบภาษาไทย #แนวข้อสอบสังคม</p>', '[\"Alevel\", \"TCAS\", \"Teacher\"]', 490.00, 1390.00, 0, 0, NULL, NULL, 0, 1, '2026-02-02 22:49:49.475', '2026-02-02 22:49:49.475'),
(748, 'book-748', 'หนังสือสรุปเนื้อหา และแนวข้อสอบเสมือนจริง A-LEVEL \" วิชา คณิตศาสตร์ \" + คอร์สติวข้อสอบ 15 ชม.', 'book', '📌เจาะลึกสรุปเนื้อหา และแนวข้อสอบเฉพาะวิชา ไปกับหนังสือแนวข้อสอบ A-LEVEL แยกเล่ม ได้แก่ หนังสือสรุปเนื้อหา และแนวข้อสอบเสมือนจริงพร้อมเฉลยอย่างละเอียด A-LEVEL \" วิชา คณิตศาสตร์ \" และคอร์สติวกว่า 15 ชั่วโมง', '<p class=\"QN2lPu\">📌เจาะลึกสรุปเนื้อหา และแนวข้อสอบเฉพาะวิชา ไปกับหนังสือแนวข้อสอบ A-LEVEL แยกเล่ม ได้แก่ หนังสือสรุปเนื้อหา และแนวข้อสอบเสมือนจริงพร้อมเฉลยอย่างละเอียด A-LEVEL \" วิชา คณิตศาสตร์ \" และคอร์สติวกว่า 15 ชั่วโมง</p>\r\n\\n<p class=\"QN2lPu\">หนังสือเล่มนี้เหมาะสำหรับ ?</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.6 ที่อยากเก็บคะแนนเต็มทุกพาร์ททุกวิชา เจาะลึกเข้มข้นกับสรุปเนื้อหาและแนวข้อสอบเสมือนจริง พร้อมเฉลยอย่างละเอียด และเตรียมพร้อมโค้งสุดท้ายก่อนสอบจริงเพราะเหลือเวลาแค่ 2 เดือน</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.5 ที่อยากเตรียมความพร้อมตั้งแต่ตอนนี้ มาเจาะข้อสอบจากโจทย์ เรียงจากข้อง่าย ไปถึงข้อยาก พร้อมเทคนิคคิดลัด ตัดช้อย</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.4 ที่อยากปูพื้นฐาน และอยากเตรียมสอบก่อนใคร รวมทุกเล่มที่ใช้สอบให้แล้วในนี้</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องๆทุกระดับชั้นที่อยากได้สรุปเนื้อหาแนวข้อสอบเสมือนจริง และเฉลยอย่างละเอียด</p>\r\n\\n<p class=\"QN2lPu\">📌เก็บแต้มอัพคะแนนสอบทุกสนาม</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบแม่นยำ</p>\r\n\\n<p class=\"QN2lPu\">✔ครบถ้วนตามโครงสร้างข้อสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">✔เฉลยละเอียดในเล่มทุกข้อ</p>\r\n\\n<p class=\"QN2lPu\">✔สำหรับสอบเข้ามหาวิทยาลัย</p>\r\n\\n<p class=\"QN2lPu\">✔เขียนโดยทีมสุดยอดติวเตอร์คุณภาพ</p>\r\n\\n<p class=\"QN2lPu\">💯ครบทุกหัวข้อตามโครงสร้างข้อสอบจริง ที่อัปเดตล่าสุด</p>\r\n\\n<p class=\"QN2lPu\">👉🏻สิ่งที่จะได้รับในหนังสือเล่มนี้</p>\r\n\\n<p class=\"QN2lPu\">✅ได้แนวข้อสอบพร้อมเฉลยอย่างละเอียดที่แม่นยำ ตามโครงสร้างข้อสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้เฉลยละเอียดในเล่ม พร้อมเทคนิค คิดลัด ตัดช้อย</p>\r\n\\n<p class=\"QN2lPu\">✅ได้คอร์สติวเฉลยละเอียดทุกข้อ (มูลค่าเล่มละ 2990 บาท)</p>\r\n\\n<p class=\"QN2lPu\">✅ได้คอร์สเตรียมติดมหาวิทยาลัยทุกรอบ ทุกคณะ กว่า 10 ชั่วโมง (มูลค่า 1990 บาท)</p>\r\n\\n<p class=\"QN2lPu\">✅ได้คอร์สวางแผนพิชิตคะแนนสอบสายคณะต่างๆ กว่าเล่มละ 50 คลิป (มูลค่าเล่มละ 1990)</p>\r\n\\n<p class=\"QN2lPu\">✅ได้กระดาษคำตอบ ได้ทดสอบเสมือนจริง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ปฏิทินการสอบ พิชิต TCAS เกณฑ์ใหม่ล่าสุด</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ตารางการอ่านหนังสือ แพลนเนอร์ชีวิตเพื่อเก็บเนื้อหาให้ครบ</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ตารางตั้งเป้าหมายชีวิตให้ได้ผลลัพธ์ที่ดีที่สุด</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ Study Plan ปฏิทินวางแผนการเรียน</p>\r\n\\n<p class=\"QN2lPu\">✅ได้เทคนิคจากรุ่นพี่ที่สอบได้คะแนนสูงตัวจริง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้รีวิวการเรียนจากพี่ๆสายคณะต่างๆ ตัวจริง</p>\r\n\\n<p class=\"QN2lPu\">✅เทคนิคการทำข้อสอบทุกพาร์ท เพื่อความรวดเร็วให้ทันเวลาสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">#หนังสือเตรียมสอบ #หนังสือสรุปมปลาย #หนังสือสรุปเนื้อหาทุกวิชา #สรุปTCAS #สรุปคณิต #เตรียมสอบมปลาย #รวมเนื้อหามปลาย #ติวสอบ #เข้ามหาลัย #TCAS69 #TCAS70 #TCAS71 #dek69 #dek70 #dek71 #A-level #JKNOWLEDGE #TGAT #TPAT #TCASเกณฑ์ใหม่ #เด็ก69 #เด็ก70 #เด็ก71 #A-level69 #A-level70 #A-level71</p>\r\n\\n<p class=\"QN2lPu\">👉สำหรับโรงเรียนหรือคุณครู ที่สนใจสั่งซื้อหนังสือจำนวนมาก สามารถสอบถามหรือสั่งซื้อเพื่อรับราคาพิเศษได้เลยนะครับ</p>', '[\"Alevel\", \"Math\"]', 390.00, 1390.00, 0, 0, NULL, NULL, 0, 1, '2026-02-02 22:49:49.475', '2026-02-02 22:49:49.475'),
(756, 'book-756', 'หนังสือสรุปเนื้อหา และแนวข้อสอบเสมือนจริง A-LEVEL \" วิชา ภาษาอังกฤษ \" + คอร์สติวข้อสอบ 15 ชม.', 'book', 'เจาะลึกสรุปเนื้อหา และแนวข้อสอบเฉพาะวิชา ไปกับหนังสือแนวข้อสอบ A-LEVEL แยกเล่ม ได้แก่ หนังสือสรุปเนื้อหา และแนวข้อสอบเสมือนจริงพร้อมเฉลยอย่างละเอียด A-LEVEL \" วิชา ภาษาอังกฤษ \" และคอร์สติวกว่า 15 ชั่วโมง', '<p class=\"QN2lPu\">📌เจาะลึกสรุปเนื้อหา และแนวข้อสอบเฉพาะวิชา ไปกับหนังสือแนวข้อสอบ A-LEVEL แยกเล่ม ได้แก่ หนังสือสรุปเนื้อหา และแนวข้อสอบเสมือนจริงพร้อมเฉลยอย่างละเอียด A-LEVEL \" วิชา ภาษาอังกฤษ \" และคอร์สติวกว่า 15 ชั่วโมง</p>\r\n\\n<p class=\"QN2lPu\">หนังสือเล่มนี้เหมาะสำหรับ ?</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.6 ที่อยากเก็บคะแนนเต็มทุกพาร์ททุกวิชา เจาะลึกเข้มข้นกับสรุปเนื้อหาและแนวข้อสอบเสมือนจริง พร้อมเฉลยอย่างละเอียด และเตรียมพร้อมโค้งสุดท้ายก่อนสอบจริงเพราะเหลือเวลาแค่ 2 เดือน</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.5 ที่อยากเตรียมความพร้อมตั้งแต่ตอนนี้ มาเจาะข้อสอบจากโจทย์ เรียงจากข้อง่าย ไปถึงข้อยาก พร้อมเทคนิคคิดลัด ตัดช้อย</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.4 ที่อยากปูพื้นฐาน และอยากเตรียมสอบก่อนใคร รวมทุกเล่มที่ใช้สอบให้แล้วในนี้</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องๆทุกระดับชั้นที่อยากได้สรุปเนื้อหาแนวข้อสอบเสมือนจริง และเฉลยอย่างละเอียด</p>\r\n\\n<p class=\"QN2lPu\">📌เก็บแต้มอัพคะแนนสอบทุกสนาม</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบแม่นยำ</p>\r\n\\n<p class=\"QN2lPu\">✔ครบถ้วนตามโครงสร้างข้อสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">✔เฉลยละเอียดในเล่มทุกข้อ</p>\r\n\\n<p class=\"QN2lPu\">✔สำหรับสอบเข้ามหาวิทยาลัย</p>\r\n\\n<p class=\"QN2lPu\">✔เขียนโดยทีมสุดยอดติวเตอร์คุณภาพ</p>\r\n\\n<p class=\"QN2lPu\">💯ครบทุกหัวข้อตามโครงสร้างข้อสอบจริง ที่อัปเดตล่าสุด</p>\r\n\\n<p class=\"QN2lPu\">👉🏻สิ่งที่จะได้รับในหนังสือเล่มนี้</p>\r\n\\n<p class=\"QN2lPu\">✅ได้แนวข้อสอบพร้อมเฉลยอย่างละเอียดที่แม่นยำ ตามโครงสร้างข้อสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้เฉลยละเอียดในเล่ม พร้อมเทคนิค คิดลัด ตัดช้อย</p>\r\n\\n<p class=\"QN2lPu\">✅ได้คอร์สติวเฉลยละเอียดทุกข้อ (มูลค่าเล่มละ 2990 บาท)</p>\r\n\\n<p class=\"QN2lPu\">✅ได้คอร์สเตรียมติดมหาวิทยาลัยทุกรอบ ทุกคณะ กว่า 10 ชั่วโมง (มูลค่า 1990 บาท)</p>\r\n\\n<p class=\"QN2lPu\">✅ได้คอร์สวางแผนพิชิตคะแนนสอบสายคณะต่างๆ กว่าเล่มละ 50 คลิป (มูลค่าเล่มละ 1990)</p>\r\n\\n<p class=\"QN2lPu\">✅ได้กระดาษคำตอบ ได้ทดสอบเสมือนจริง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ปฏิทินการสอบ พิชิต TCAS เกณฑ์ใหม่ล่าสุด</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ตารางการอ่านหนังสือ แพลนเนอร์ชีวิตเพื่อเก็บเนื้อหาให้ครบ</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ตารางตั้งเป้าหมายชีวิตให้ได้ผลลัพธ์ที่ดีที่สุด</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ Study Plan ปฏิทินวางแผนการเรียน</p>\r\n\\n<p class=\"QN2lPu\">✅ได้เทคนิคจากรุ่นพี่ที่สอบได้คะแนนสูงตัวจริง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้รีวิวการเรียนจากพี่ๆสายคณะต่างๆ ตัวจริง</p>\r\n\\n<p class=\"QN2lPu\">✅เทคนิคการทำข้อสอบทุกพาร์ท เพื่อความรวดเร็วให้ทันเวลาสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">#หนังสือเตรียมสอบ #หนังสือสรุปมปลาย #หนังสือสรุปเนื้อหาทุกวิชา #สรุปTCAS #สรุปภาษาอังกฤษ #เตรียมสอบมปลาย #รวมเนื้อหามปลาย #ติวสอบ #เข้ามหาลัย #TCAS69 #TCAS70 #TCAS71 #dek69 #dek70 #dek71 #A-level #JKNOWLEDGE #TGAT #TPAT #TCASเกณฑ์ใหม่ #เด็ก69 #เด็ก70 #เด็ก71 #A-level69 #A-level70 #A-level71</p>\r\n\\n<p class=\"QN2lPu\">👉สำหรับโรงเรียนหรือคุณครู ที่สนใจสั่งซื้อหนังสือจำนวนมาก สามารถสอบถามหรือสั่งซื้อเพื่อรับราคาพิเศษได้เลยนะครับ</p>', '[\"Alevel\", \"Eng\"]', 390.00, 1390.00, 0, 0, NULL, NULL, 0, 1, '2026-02-02 22:49:49.475', '2026-02-02 22:49:49.475'),
(764, 'book-764', 'หนังสือสรุปเนื้อหา และแนวข้อสอบเสมือนจริง A-LEVEL \"วิชาภาษาไทย และ สังคมศึกษา\"+คอร์สติวข้อสอบ 15 ชม.', 'book', 'เจาะลึกสรุปเนื้อหา และแนวข้อสอบเฉพาะวิชา ไปกับหนังสือแนวข้อสอบ A-LEVEL แยกเล่ม ได้แก่ หนังสือสรุปเนื้อหา และแนวข้อสอบเสมือนจริง A-LEVEL \"วิชาภาษาไทย และ สังคมศึกษา\"+คอร์สติวข้อสอบ 15 ชม.', '<p class=\"QN2lPu\">📌เจาะลึกสรุปเนื้อหา และแนวข้อสอบเฉพาะวิชา ไปกับหนังสือแนวข้อสอบ A-LEVEL แยกเล่ม ได้แก่ หนังสือสรุปเนื้อหา และแนวข้อสอบเสมือนจริง A-LEVEL \"วิชาภาษาไทย และ สังคมศึกษา\"+คอร์สติวข้อสอบ 15 ชม.</p>\r\n\\n<p class=\"QN2lPu\">หนังสือเล่มนี้เหมาะสำหรับ ?</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.6 ที่อยากเก็บคะแนนเต็มทุกพาร์ททุกวิชา เจาะลึกเข้มข้นกับสรุปเนื้อหาและแนวข้อสอบเสมือนจริง พร้อมเฉลยอย่างละเอียด และเตรียมพร้อมโค้งสุดท้ายก่อนสอบจริงเพราะเหลือเวลาแค่ 2 เดือน</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.5 ที่อยากเตรียมความพร้อมตั้งแต่ตอนนี้ มาเจาะข้อสอบจากโจทย์ เรียงจากข้อง่าย ไปถึงข้อยาก พร้อมเทคนิคคิดลัด ตัดช้อย</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.4 ที่อยากปูพื้นฐาน และอยากเตรียมสอบก่อนใคร รวมทุกเล่มที่ใช้สอบให้แล้วในนี้</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องๆทุกระดับชั้นที่อยากได้สรุปเนื้อหาแนวข้อสอบเสมือนจริง และเฉลยอย่างละเอียด</p>\r\n\\n<p class=\"QN2lPu\">📌เก็บแต้มอัพคะแนนสอบทุกสนาม</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบแม่นยำ</p>\r\n\\n<p class=\"QN2lPu\">✔ครบถ้วนตามโครงสร้างข้อสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">✔เฉลยละเอียดในเล่มทุกข้อ</p>\r\n\\n<p class=\"QN2lPu\">✔สำหรับสอบเข้ามหาวิทยาลัย</p>\r\n\\n<p class=\"QN2lPu\">✔เขียนโดยทีมสุดยอดติวเตอร์คุณภาพ</p>\r\n\\n<p class=\"QN2lPu\">💯ครบทุกหัวข้อตามโครงสร้างข้อสอบจริง ที่อัปเดตล่าสุด</p>\r\n\\n<p class=\"QN2lPu\">👉🏻สิ่งที่จะได้รับในหนังสือเล่มนี้</p>\r\n\\n<p class=\"QN2lPu\">✅ได้แนวข้อสอบพร้อมเฉลยอย่างละเอียดที่แม่นยำ ตามโครงสร้างข้อสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้เฉลยละเอียดในเล่ม พร้อมเทคนิค คิดลัด ตัดช้อย</p>\r\n\\n<p class=\"QN2lPu\">✅ได้คอร์สติวเฉลยละเอียดทุกข้อ (มูลค่าเล่มละ 2990 บาท)</p>\r\n\\n<p class=\"QN2lPu\">✅ได้คอร์สเตรียมติดมหาวิทยาลัยทุกรอบ ทุกคณะ กว่า 10 ชั่วโมง (มูลค่า 1990 บาท)</p>\r\n\\n<p class=\"QN2lPu\">✅ได้คอร์สวางแผนพิชิตคะแนนสอบสายคณะต่างๆ กว่าเล่มละ 50 คลิป (มูลค่าเล่มละ 1990)</p>\r\n\\n<p class=\"QN2lPu\">✅ได้กระดาษคำตอบ ได้ทดสอบเสมือนจริง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ปฏิทินการสอบ พิชิต TCAS เกณฑ์ใหม่ล่าสุด</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ตารางการอ่านหนังสือ แพลนเนอร์ชีวิตเพื่อเก็บเนื้อหาให้ครบ</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ตารางตั้งเป้าหมายชีวิตให้ได้ผลลัพธ์ที่ดีที่สุด</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ Study Plan ปฏิทินวางแผนการเรียน</p>\r\n\\n<p class=\"QN2lPu\">✅ได้เทคนิคจากรุ่นพี่ที่สอบได้คะแนนสูงตัวจริง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้รีวิวการเรียนจากพี่ๆสายคณะต่างๆ ตัวจริง</p>\r\n\\n<p class=\"QN2lPu\">✅เทคนิคการทำข้อสอบทุกพาร์ท เพื่อความรวดเร็วให้ทันเวลาสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">#หนังสือเตรียมสอบ #หนังสือสรุปมปลาย #หนังสือสรุปเนื้อหาทุกวิชา #สรุปTCAS #สรุปภาษาไทย #สรุปสังคม #เตรียมสอบมปลาย #รวมเนื้อหามปลาย #ติวสอบ #เข้ามหาลัย #TCAS69 #TCAS70 #TCAS71 #dek69 #dek70 #dek71 #A-level #JKNOWLEDGE #TGAT #TPAT #TCASเกณฑ์ใหม่ #เด็ก69 #เด็ก70 #เด็ก71 #A-level69 #A-level70 #A-level71</p>\r\n\\n<p class=\"QN2lPu\">👉สำหรับโรงเรียนหรือคุณครู ที่สนใจสั่งซื้อหนังสือจำนวนมาก สามารถสอบถามหรือสั่งซื้อเพื่อรับราคาพิเศษได้เลยนะครับ</p>', '[\"Alevel\", \"Social\", \"Thai\"]', 390.00, 1390.00, 0, 0, NULL, NULL, 0, 1, '2026-02-02 22:49:49.475', '2026-02-02 22:49:49.475');
INSERT INTO `shop_products` (`id`, `public_id`, `name`, `category`, `description`, `details`, `tags_json`, `price`, `compare_at_price`, `stock_left`, `sold_count`, `external_url`, `badge`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(773, 'book-773', 'หนังสือ แนวข้อสอบเสมือนจริง มนุษย์ นิติ บริหาร + คอร์สติวเฉลยข้อสอบ 15 ชม.', 'book', '💜หนังสือเตรียมสอบสายมนุษย์ฯ-นิติฯ-บริหารฯ + คอร์สติวเฉลยข้อสอบ กว่า 15 ชั่วโมง 💜เตรียมความพร้อมสู่การสอบมนุษย์ฯ-นิติฯ-บริหารฯ', '<p class=\"QN2lPu\">💜หนังสือเตรียมสอบสายมนุษย์ฯ-นิติฯ-บริหารฯ + คอร์สติวเฉลยข้อสอบ กว่า 15 ชั่วโมง</p>\r\n\\n<p class=\"QN2lPu\">💜เตรียมความพร้อมสู่การสอบมนุษย์ฯ-นิติฯ-บริหารฯ</p>\r\n\\n<p class=\"QN2lPu\">เก็บแต้มอัพคะแนนเพิ่มแน่ แค่มีเล่มนี้ 📌📌📌</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบแม่นยำ</p>\r\n\\n<p class=\"QN2lPu\">✔ครบถ้วนตามโครงสร้างข้อสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบแน่นๆ</p>\r\n\\n<p class=\"QN2lPu\">✔สรุปเนื้อหา จุดออกบ่อย เฉลยละเอียดในเล่มทุกข้อ</p>\r\n\\n<p class=\"QN2lPu\">✔สำหรับสอบสาย มนุษย์ฯ-นิติฯ-บริหารฯ ทุกมหาวิทยาลัยชั้นนำ</p>\r\n\\n<p class=\"QN2lPu\">✔เขียนโดยทีมสุดยอดติวเตอร์คุณภาพ ที่มีประสบการณ์สอนมากกว่า 20 ปี</p>\r\n\\n<p class=\"QN2lPu\">ในเล่ม มีครบ 4 วิชาที่ใช้สอบ</p>\r\n\\n<p class=\"QN2lPu\">✅A-Level คณิตศาสตร์ประยุกต์1</p>\r\n\\n<p class=\"QN2lPu\">✅A-Level ภาษาอังกฤษ</p>\r\n\\n<p class=\"QN2lPu\">✅A-Level ภาษาไทย</p>\r\n\\n<p class=\"QN2lPu\">✅A-Level สังคมศึกษา</p>\r\n\\n<p class=\"QN2lPu\">💯เล่มเดียวจบ ครบทุกวิชาที่ใช้สอบ ครบทุกหัวข้อตามโครงสร้างข้อสอบจริง Test Blueprint เกณฑ์ใหม่ล่าสุด</p>\r\n\\n<p class=\"QN2lPu\">เล่มนี้เหมาะสำหรับ ?</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.6 ที่อยากเรียนคณะมนุษย์ฯ-นิติฯ-บริหารฯ เตรียมพร้อมโค้งสุดท้ายก่อนสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.5 ที่อยากเตรียมความพร้อมตั้งแต่ตอนนี้ มาเจาะข้อสอบจากโจทย์ เรียงจากข้อง่าย ไปถึงข้อยาก</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.4 ที่มีความฝันและเป็นเป้าหมายในการเรียนมนุษย์ฯ-นิติฯ-บริหารฯ ต้องการปูพื้นฐาน และพร้อมเตรียมสอบก่อนใคร เพราะเรารวมทุกวิชาที่ใช้สอบให้แล้วในเล่มนี้</p>\r\n\\n<p class=\"QN2lPu\">👉🏻 น้อง ๆ ทุกระดับชั้น ทุกแผนการเรียน ที่อยากได้แนวข้อสอบเสมือนจริง เพราะเล่มนี้รวมทุกวิชาที่ใช้สอบไว้ให้แล้ว</p>\r\n\\n<p class=\"QN2lPu\">👉🏻สิ่งที่จะได้รับในหนังสือเล่มนี้</p>\r\n\\n<p class=\"QN2lPu\">✅ได้แนวข้อสอบพร้อมเฉลยอย่างละเอียดที่แม่นยำ ตามโครงสร้าง Test Blueprint</p>\r\n\\n<p class=\"QN2lPu\">✅ได้เฉลยละเอียดในเล่มทุกข้อ พร้อมเทคนิค คิดลัด ตัดช้อย</p>\r\n\\n<p class=\"QN2lPu\">✅ได้คอร์สติวเฉลยละเอียดทุกข้อ กว่า 15 ชม.</p>\r\n\\n<p class=\"QN2lPu\">✅ได้กระดาษคำตอบ ได้ทดสอบเสมือนจริง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ปฏิทินการสอบ พิชิต TCAS เกณฑ์ใหม่ล่าสุด</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ตารางการอ่านหนังสือ แพลนเนอร์ชีวิตเพื่อเก็บเนื้อหาให้ครบ</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ตารางตั้งเป้าหมายชีวิตให้ได้ผลลัพธ์ที่ดีที่สุด</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ Study Plan ปฏิทินวางแผนการเรียน</p>\r\n\\n<p class=\"QN2lPu\">✅ได้เทคนิคจากรุ่นพี่ที่สอบติดตัวจริง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้รีวิวการเรียนจากพี่ๆที่เรียนคณะมนุษย์ฯ-นิติฯ-บริหารฯ มหาวิทยาลัยชั้นนำ.</p>\r\n\\n<p class=\"QN2lPu\">เก็บแต้มอัพคะแนน TCAS เพิ่มแน่ แค่มีเล่มนี้ 📌📌📌</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบแม่นยำ</p>\r\n\\n<p class=\"QN2lPu\">✔ครบถ้วนตามโครงสร้างข้อสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบแน่นๆ</p>\r\n\\n<p class=\"QN2lPu\">✔เฉลยละเอียดในเล่มทุกข้อ</p>\r\n\\n<p class=\"QN2lPu\">✔สำหรับสอบเข้ามหาวิทยาลัยชั้นนำทั่วประเทศ</p>\r\n\\n<p class=\"QN2lPu\">✔เขียนโดยทีมสุดยอดติวเตอร์คุณภาพจากรั้วมหาวิทยาลัยชั้นนำของประเทศไทย</p>\r\n\\n<p class=\"QN2lPu\">💯เล่มเดียวจบ ครบทุกวิชาที่ใช้สอบ ครบทุกหัวข้อตามโครงสร้างข้อสอบจริง Test Blueprint เกณฑ์ใหม่ล่าสุด</p>\r\n\\n<p class=\"QN2lPu\">หนังสือเตรียมสอบสายมนุษย์ฯ-นิติฯ-บริหารฯ + คอร์สติวเฉลยข้อสอบ กว่า 15 ชั่วโมง</p>\r\n\\n<p class=\"QN2lPu\">ฟรี!! ค่าจัดส่งทั่วประเทศ</p>\r\n\\n<p class=\"QN2lPu\">👉สำหรับโรงเรียนหรือคุณครู ที่สนใจสั่งซื้อหนังสือจำนวนมาก สามารถสอบถามหรือสั่งซื้อเพื่อรับราคาพิเศษได้เลยนะครับ</p>\r\n\\n<p class=\"QN2lPu\">#เตรียมสอบมนุษย์ฯ #เตรียมสอบนิติฯ #หนังสือเตรียมสอบบริหารฯ #มนุษยศาสตร์ #นิติศาสตร์ #บริหารธุรกิจ #เฉลยข้อสอบ #เตรียมสอบมปลาย #TCAS69 #TCAS70 #TCAS71 #แนวข้อสอบคณิต #แนวข้อสอบภาษาไทย #แนวข้อสอบภาษาอังกฤษ #แนวข้อสอบสังคม #เตรียมสอบมปลาย #ติวสอบ #เข้ามหาลัย #DEK769 #DEK70 #DEK71 #JKNOWLEDGE #Alevel</p>\r\n\\n<p class=\"QN2lPu\">#เตรียมสอบมนุษย์ฯ #เตรียมสอบนิติฯ #หนังสือเตรียมสอบบริหารฯ #มนุษยศาสตร์ #นิติศาสตร์ #บริหารธุรกิจ #เฉลยข้อสอบ #เตรียมสอบมปลาย #TCAS69 #TCAS70 #TCAS71 #แนวข้อสอบคณิต #แนวข้อสอบภาษาไทย #แนวข้อสอบภาษาอังกฤษ #แนวข้อสอบสังคม #ติวสอบ #เข้ามหาลัย #DEK69 #DEK70 #DEK71 #JKNOWLEDGE #Alevel #Alevel69 #Alevel70 #Alevel71 #อ่านเร็วจำไว #ติวเข้มสอบจริง #สอบติดมหาลัย #ติวสอบมนุษย์ฯ #ติวสอบนิติฯ #ติวสอบบริหาร #แนวข้อสอบมนุษย์ฯ #แนวข้อสอบนิติฯ #แนวข้อสอบบริหาร #ติวสอบภาษาไทย #ติวสอบสังคม #ติวสอบภาษาอังกฤษ #ติวสอบคณิต #ติวสอบAlevel #ติวสอบTGAT #ติวสอบTPAT #ติวสอบออนไลน์ #สอบตรง</p>', '[\"Alevel\", \"human\"]', 490.00, 1390.00, 0, 0, NULL, NULL, 0, 1, '2026-02-02 22:49:49.475', '2026-02-02 22:49:49.475'),
(774, 'book-774', 'หนังสือสรุปเนื้อหา และแนวข้อสอบเสมือนจริง A-LEVEL \" วิชา ฟิสิกส์ \" + คอร์สติวข้อสอบ 20 ชั่วโมง', 'book', 'เจาะลึกสรุปเนื้อหา และแนวข้อสอบเฉพาะวิชา ไปกับหนังสือแนวข้อสอบ A-LEVEL แยกเล่ม ได้แก่ หนังสือสรุปเนื้อหา และแนวข้อสอบเสมือนจริงพร้อมเฉลยอย่างละเอียด A-LEVEL \" วิชา ฟิสิกส์ \"และคอร์สติวกว่า 20 ชั่วโมง', '<p class=\"QN2lPu\">📌เจาะลึกสรุปเนื้อหา และแนวข้อสอบเฉพาะวิชา ไปกับหนังสือแนวข้อสอบ A-LEVEL แยกเล่ม ได้แก่ หนังสือสรุปเนื้อหา และแนวข้อสอบเสมือนจริงพร้อมเฉลยอย่างละเอียด A-LEVEL \" วิชา ฟิสิกส์ \"และคอร์สติวกว่า 20 ชั่วโมง</p>\r\n\\n<p class=\"QN2lPu\">หนังสือเล่มนี้เหมาะสำหรับ ?</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.6 ที่อยากเก็บคะแนนเต็มทุกพาร์ททุกวิชา เจาะลึกเข้มข้นกับสรุปเนื้อหาและแนวข้อสอบเสมือนจริง พร้อมเฉลยอย่างละเอียด และเตรียมพร้อมโค้งสุดท้ายก่อนสอบจริงเพราะเหลือเวลาแค่ 2 เดือน</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.5 ที่อยากเตรียมความพร้อมตั้งแต่ตอนนี้ มาเจาะข้อสอบจากโจทย์ เรียงจากข้อง่าย ไปถึงข้อยาก พร้อมเทคนิคคิดลัด ตัดช้อย</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.4 ที่อยากปูพื้นฐาน และอยากเตรียมสอบก่อนใคร รวมทุกเล่มที่ใช้สอบให้แล้วในนี้</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องๆทุกระดับชั้นที่อยากได้สรุปเนื้อหาแนวข้อสอบเสมือนจริง และเฉลยอย่างละเอียด</p>\r\n\\n<p class=\"QN2lPu\">📌เก็บแต้มอัพคะแนนสอบทุกสนาม</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบแม่นยำ</p>\r\n\\n<p class=\"QN2lPu\">✔ครบถ้วนตามโครงสร้างข้อสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">✔เฉลยละเอียดในเล่มทุกข้อ</p>\r\n\\n<p class=\"QN2lPu\">✔สำหรับสอบเข้ามหาวิทยาลัย</p>\r\n\\n<p class=\"QN2lPu\">✔เขียนโดยทีมสุดยอดติวเตอร์คุณภาพ</p>\r\n\\n&nbsp;\r\n\\n<p class=\"QN2lPu\">💯ครบทุกหัวข้อตามโครงสร้างข้อสอบจริง ที่อัปเดตล่าสุด</p>\r\n\\n<p class=\"QN2lPu\">👉🏻สิ่งที่จะได้รับในหนังสือเล่มนี้</p>\r\n\\n<p class=\"QN2lPu\">✅ได้แนวข้อสอบพร้อมเฉลยอย่างละเอียดที่แม่นยำ ตามโครงสร้างข้อสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้เฉลยละเอียดในเล่ม พร้อมเทคนิค คิดลัด ตัดช้อย</p>\r\n\\n<p class=\"QN2lPu\">✅ได้คอร์สติวเฉลยละเอียดทุกข้อ (มูลค่าเล่มละ 2990 บาท)</p>\r\n\\n<p class=\"QN2lPu\">✅ได้คอร์สเตรียมติดมหาวิทยาลัยทุกรอบ ทุกคณะ กว่า 10 ชั่วโมง (มูลค่า 1990 บาท)</p>\r\n\\n<p class=\"QN2lPu\">✅ได้คอร์สวางแผนพิชิตคะแนนสอบสายคณะต่างๆ กว่าเล่มละ 50 คลิป (มูลค่าเล่มละ 1990)</p>\r\n\\n<p class=\"QN2lPu\">✅ได้กระดาษคำตอบ ได้ทดสอบเสมือนจริง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ปฏิทินการสอบ พิชิต TCAS เกณฑ์ใหม่ล่าสุด</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ตารางการอ่านหนังสือ แพลนเนอร์ชีวิตเพื่อเก็บเนื้อหาให้ครบ</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ตารางตั้งเป้าหมายชีวิตให้ได้ผลลัพธ์ที่ดีที่สุด</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ Study Plan ปฏิทินวางแผนการเรียน</p>\r\n\\n<p class=\"QN2lPu\">✅ได้เทคนิคจากรุ่นพี่ที่สอบได้คะแนนสูงตัวจริง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้รีวิวการเรียนจากพี่ๆสายคณะต่างๆ ตัวจริง</p>\r\n\\n<p class=\"QN2lPu\">✅เทคนิคการทำข้อสอบทุกพาร์ท เพื่อความรวดเร็วให้ทันเวลาสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">#หนังสือเตรียมสอบ #หนังสือสรุปมปลาย #หนังสือสรุปเนื้อหาทุกวิชา #สรุปTCAS #สรุปฟิสิกส์ #เตรียมสอบมปลาย #รวมเนื้อหามปลาย #ติวสอบ #เข้ามหาลัย #TCAS69 #TCAS70 #TCAS71 #dek69 #dek70 #dek71 #A-level #JKNOWLEDGE #TGAT #TPAT #TCASเกณฑ์ใหม่ #เด็ก69 #เด็ก70 #เด็ก71 #A-level69 #A-level70 #A-level71</p>\r\n\\n<p class=\"QN2lPu\">👉สำหรับโรงเรียนหรือคุณครู ที่สนใจสั่งซื้อหนังสือจำนวนมาก สามารถสอบถามหรือสั่งซื้อเพื่อรับราคาพิเศษได้เลยนะครับ</p>', '[\"Alevel\", \"physics\"]', 390.00, 1390.00, 0, 0, NULL, NULL, 0, 1, '2026-02-02 22:49:49.475', '2026-02-02 22:49:49.475'),
(782, 'book-782', 'หนังสือสรุปเนื้อหา และแนวข้อสอบเสมือนจริง A-LEVEL \" วิชา เคมี \" + คอร์สติวข้อสอบ 20 ชม.', 'book', '📌 เจาะลึกสรุปเนื้อหา และแนวข้อสอบเฉพาะวิชา ไปกับหนังสือแนวข้อสอบ A-LEVEL แยกเล่ม ได้แก่ หนังสือสรุปเนื้อหา และแนวข้อสอบเสมือนจริงพร้อมเฉลยอย่างละเอียด A-LEVEL \" วิชา เคมี \" และ คอร์สติวกว่า 20 ชั่วโมง', '<p class=\"QN2lPu\">📌เจาะลึกสรุปเนื้อหา และแนวข้อสอบเฉพาะวิชา ไปกับหนังสือแนวข้อสอบ A-LEVEL แยกเล่ม ได้แก่</p>\r\n\\n<p class=\"QN2lPu\">หนังสือสรุปเนื้อหา และแนวข้อสอบเสมือนจริงพร้อมเฉลยอย่างละเอียด A-LEVEL \" วิชา เคมี \" และ คอร์สติวกว่า 20 ชั่วโมง</p>\r\n\\n<p class=\"QN2lPu\">หนังสือเล่มนี้เหมาะสำหรับ ?</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.6 ที่อยากเก็บคะแนนเต็มทุกพาร์ททุกวิชา เจาะลึกเข้มข้นกับสรุปเนื้อหาและแนวข้อสอบเสมือนจริง พร้อมเฉลยอย่างละเอียด และเตรียมพร้อมโค้งสุดท้ายก่อนสอบจริงเพราะเหลือเวลาแค่ 2 เดือน</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.5 ที่อยากเตรียมความพร้อมตั้งแต่ตอนนี้ มาเจาะข้อสอบจากโจทย์ เรียงจากข้อง่าย ไปถึงข้อยาก พร้อมเทคนิคคิดลัด ตัดช้อย</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.4 ที่อยากปูพื้นฐาน และอยากเตรียมสอบก่อนใคร รวมทุกเล่มที่ใช้สอบให้แล้วในนี้</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องๆทุกระดับชั้นที่อยากได้สรุปเนื้อหาแนวข้อสอบเสมือนจริง และเฉลยอย่างละเอียด</p>\r\n\\n<p class=\"QN2lPu\">📌เก็บแต้มอัพคะแนนสอบทุกสนาม</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบแม่นยำ</p>\r\n\\n<p class=\"QN2lPu\">✔ครบถ้วนตามโครงสร้างข้อสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">✔เฉลยละเอียดในเล่มทุกข้อ</p>\r\n\\n<p class=\"QN2lPu\">✔สำหรับสอบเข้ามหาวิทยาลัย</p>\r\n\\n<p class=\"QN2lPu\">✔เขียนโดยทีมสุดยอดติวเตอร์คุณภาพ</p>\r\n\\n<p class=\"QN2lPu\">💯ครบทุกหัวข้อตามโครงสร้างข้อสอบจริง ที่อัปเดตล่าสุด</p>\r\n\\n<p class=\"QN2lPu\">👉🏻สิ่งที่จะได้รับในหนังสือเล่มนี้</p>\r\n\\n<p class=\"QN2lPu\">✅ได้แนวข้อสอบพร้อมเฉลยอย่างละเอียดที่แม่นยำ ตามโครงสร้างข้อสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้เฉลยละเอียดในเล่ม พร้อมเทคนิค คิดลัด ตัดช้อย</p>\r\n\\n<p class=\"QN2lPu\">✅ได้คอร์สติวเฉลยละเอียดทุกข้อ (มูลค่าเล่มละ 2990 บาท)</p>\r\n\\n<p class=\"QN2lPu\">✅ได้คอร์สเตรียมติดมหาวิทยาลัยทุกรอบ ทุกคณะ กว่า 10 ชั่วโมง (มูลค่า 1990 บาท)</p>\r\n\\n<p class=\"QN2lPu\">✅ได้คอร์สวางแผนพิชิตคะแนนสอบสายคณะต่างๆ กว่าเล่มละ 50 คลิป (มูลค่าเล่มละ 1990)</p>\r\n\\n<p class=\"QN2lPu\">✅ได้กระดาษคำตอบ ได้ทดสอบเสมือนจริง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ปฏิทินการสอบ พิชิต TCAS เกณฑ์ใหม่ล่าสุด</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ตารางการอ่านหนังสือ แพลนเนอร์ชีวิตเพื่อเก็บเนื้อหาให้ครบ</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ตารางตั้งเป้าหมายชีวิตให้ได้ผลลัพธ์ที่ดีที่สุด</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ Study Plan ปฏิทินวางแผนการเรียน</p>\r\n\\n<p class=\"QN2lPu\">✅ได้เทคนิคจากรุ่นพี่ที่สอบได้คะแนนสูงตัวจริง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้รีวิวการเรียนจากพี่ๆสายคณะต่างๆ ตัวจริง</p>\r\n\\n<p class=\"QN2lPu\">✅เทคนิคการทำข้อสอบทุกพาร์ท เพื่อความรวดเร็วให้ทันเวลาสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">#หนังสือเตรียมสอบ #หนังสือสรุปมปลาย #หนังสือสรุปเนื้อหาทุกวิชา #สรุปTCAS #สรุปเคมี #เตรียมสอบมปลาย #รวมเนื้อหามปลาย #ติวสอบ #เข้ามหาลัย #TCAS69 #TCAS70 #TCAS71 #dek69 #dek70 #dek71 #A-level #JKNOWLEDGE #TGAT #TPAT #TCASเกณฑ์ใหม่ #เด็ก69 #เด็ก70 #เด็ก71 #A-level69 #A-level70 #A-level71</p>\r\n\\n<p class=\"QN2lPu\">👉สำหรับโรงเรียนหรือคุณครู ที่สนใจสั่งซื้อหนังสือจำนวนมาก สามารถสอบถามหรือสั่งซื้อเพื่อรับราคาพิเศษได้เลยนะครับ</p>', '[\"Alevel\", \"chemistry\"]', 390.00, 1390.00, 0, 0, NULL, NULL, 0, 1, '2026-02-02 22:49:49.475', '2026-02-02 22:49:49.475'),
(791, 'book-791', 'หนังสือสรุปเนื้อหา และแนวข้อสอบเสมือนจริง A-LEVEL \" วิชา ชีววิทยา \" + คอร์สติวข้อสอบ 20 ชม.', 'book', 'เจาะลึกสรุปเนื้อหา และแนวข้อสอบเฉพาะวิชา ไปกับหนังสือแนวข้อสอบ A-LEVEL แยกเล่ม ได้แก่ หนังสือสรุปเนื้อหา และแนวข้อสอบเสมือนจริงพร้อมเฉลยอย่างละเอียด A-LEVEL \"วิชา ชีววิทยา\"และคอร์สติวกว่า 20 ชั่วโมง', '<p class=\"QN2lPu\">📌เจาะลึกสรุปเนื้อหา และแนวข้อสอบเฉพาะวิชา ไปกับหนังสือแนวข้อสอบ A-LEVEL แยกเล่ม ได้แก่</p>\r\n\\n<p class=\"QN2lPu\">หนังสือสรุปเนื้อหา และแนวข้อสอบเสมือนจริงพร้อมเฉลยอย่างละเอียด A-LEVEL \"วิชา ชีววิทยา\"และคอร์สติวกว่า 20 ชั่วโมง</p>\r\n\\n<p class=\"QN2lPu\">หนังสือเล่มนี้เหมาะสำหรับ ?</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.6 ที่อยากเก็บคะแนนเต็มทุกพาร์ททุกวิชา เจาะลึกเข้มข้นกับสรุปเนื้อหาและแนวข้อสอบเสมือนจริง พร้อมเฉลยอย่างละเอียด และเตรียมพร้อมโค้งสุดท้ายก่อนสอบจริงเพราะเหลือเวลาแค่ 2 เดือน</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.5 ที่อยากเตรียมความพร้อมตั้งแต่ตอนนี้ มาเจาะข้อสอบจากโจทย์ เรียงจากข้อง่าย ไปถึงข้อยาก พร้อมเทคนิคคิดลัด ตัดช้อย</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องม.4 ที่อยากปูพื้นฐาน และอยากเตรียมสอบก่อนใคร รวมทุกเล่มที่ใช้สอบให้แล้วในนี้</p>\r\n\\n<p class=\"QN2lPu\">👉🏻น้องๆทุกระดับชั้นที่อยากได้สรุปเนื้อหาแนวข้อสอบเสมือนจริง และเฉลยอย่างละเอียด</p>\r\n\\n<p class=\"QN2lPu\">📌เก็บแต้มอัพคะแนนสอบทุกสนาม</p>\r\n\\n<p class=\"QN2lPu\">✔แนวข้อสอบแม่นยำ</p>\r\n\\n<p class=\"QN2lPu\">✔ครบถ้วนตามโครงสร้างข้อสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">✔เฉลยละเอียดในเล่มทุกข้อ</p>\r\n\\n<p class=\"QN2lPu\">✔สำหรับสอบเข้ามหาวิทยาลัย</p>\r\n\\n<p class=\"QN2lPu\">✔เขียนโดยทีมสุดยอดติวเตอร์คุณภาพ</p>\r\n\\n<p class=\"QN2lPu\">💯ครบทุกหัวข้อตามโครงสร้างข้อสอบจริง ที่อัปเดตล่าสุด</p>\r\n\\n<p class=\"QN2lPu\">👉🏻สิ่งที่จะได้รับในหนังสือเล่มนี้</p>\r\n\\n<p class=\"QN2lPu\">✅ได้แนวข้อสอบพร้อมเฉลยอย่างละเอียดที่แม่นยำ ตามโครงสร้างข้อสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้เฉลยละเอียดในเล่ม พร้อมเทคนิค คิดลัด ตัดช้อย</p>\r\n\\n<p class=\"QN2lPu\">✅ได้คอร์สติวเฉลยละเอียดทุกข้อ (มูลค่าเล่มละ 2990 บาท)</p>\r\n\\n<p class=\"QN2lPu\">✅ได้คอร์สเตรียมติดมหาวิทยาลัยทุกรอบ ทุกคณะ กว่า 10 ชั่วโมง (มูลค่า 1990 บาท)</p>\r\n\\n<p class=\"QN2lPu\">✅ได้คอร์สวางแผนพิชิตคะแนนสอบสายคณะต่างๆ กว่าเล่มละ 50 คลิป (มูลค่าเล่มละ 1990)</p>\r\n\\n<p class=\"QN2lPu\">✅ได้กระดาษคำตอบ ได้ทดสอบเสมือนจริง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ปฏิทินการสอบ พิชิต TCAS เกณฑ์ใหม่ล่าสุด</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ตารางการอ่านหนังสือ แพลนเนอร์ชีวิตเพื่อเก็บเนื้อหาให้ครบ</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ตารางตั้งเป้าหมายชีวิตให้ได้ผลลัพธ์ที่ดีที่สุด</p>\r\n\\n<p class=\"QN2lPu\">✅ได้ Study Plan ปฏิทินวางแผนการเรียน</p>\r\n\\n<p class=\"QN2lPu\">✅ได้เทคนิคจากรุ่นพี่ที่สอบได้คะแนนสูงตัวจริง</p>\r\n\\n<p class=\"QN2lPu\">✅ได้รีวิวการเรียนจากพี่ๆสายคณะต่างๆ ตัวจริง</p>\r\n\\n<p class=\"QN2lPu\">✅เทคนิคการทำข้อสอบทุกพาร์ท เพื่อความรวดเร็วให้ทันเวลาสอบจริง</p>\r\n\\n<p class=\"QN2lPu\">#หนังสือเตรียมสอบ #หนังสือสรุปมปลาย #หนังสือสรุปเนื้อหาทุกวิชา #สรุปTCAS #สรุปชีวะ #เตรียมสอบมปลาย #รวมเนื้อหามปลาย #ติวสอบ #เข้ามหาลัย #TCAS69 #TCAS70 #TCAS71 #dek69 #dek70 #dek71 #A-level #JKNOWLEDGE #TGAT #TPAT #TCASเกณฑ์ใหม่ #เด็ก69 #เด็ก70 #เด็ก71 #A-level69 #A-level70 #A-level71</p>\r\n\\n<p class=\"QN2lPu\">👉สำหรับโรงเรียนหรือคุณครู ที่สนใจสั่งซื้อหนังสือจำนวนมาก สามารถสอบถามหรือสั่งซื้อเพื่อรับราคาพิเศษได้เลยนะครับ</p>', '[\"Alevel\", \"Bio\"]', 390.00, 1390.00, 0, 0, NULL, NULL, 0, 1, '2026-02-02 22:49:49.475', '2026-02-02 22:49:49.475');

-- --------------------------------------------------------

--
-- Table structure for table `shop_product_images`
--

CREATE TABLE `shop_product_images` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `image_url` text NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shop_product_images`
--

INSERT INTO `shop_product_images` (`id`, `product_id`, `image_url`, `sort_order`, `created_at`) VALUES
(1, 4, 'https://placehold.co/800x800?text=Book+2E', 5, '2026-02-01 14:54:50.870'),
(2, 4, 'https://placehold.co/800x800?text=Book+2D', 4, '2026-02-01 14:54:50.870'),
(3, 4, 'https://placehold.co/800x800?text=Book+2C', 3, '2026-02-01 14:54:50.870'),
(4, 4, 'https://placehold.co/800x800?text=Book+2B', 2, '2026-02-01 14:54:50.870'),
(5, 4, 'https://placehold.co/800x800?text=Book+2A', 1, '2026-02-01 14:54:50.870'),
(6, 1, 'https://placehold.co/800x800?text=Course+1E', 5, '2026-02-01 14:54:50.870'),
(7, 1, 'https://placehold.co/800x800?text=Course+1D', 4, '2026-02-01 14:54:50.870'),
(8, 1, 'https://placehold.co/800x800?text=Course+1C', 3, '2026-02-01 14:54:50.870'),
(9, 1, 'https://placehold.co/800x800?text=Course+1B', 2, '2026-02-01 14:54:50.870'),
(10, 1, 'https://placehold.co/800x800?text=Course+1A', 1, '2026-02-01 14:54:50.870'),
(11, 2, 'https://placehold.co/800x800?text=Course+2E', 5, '2026-02-01 14:54:50.870'),
(12, 2, 'https://placehold.co/800x800?text=Course+2D', 4, '2026-02-01 14:54:50.870'),
(13, 2, 'https://placehold.co/800x800?text=Course+2C', 3, '2026-02-01 14:54:50.870'),
(14, 2, 'https://placehold.co/800x800?text=Course+2B', 2, '2026-02-01 14:54:50.870'),
(15, 2, 'https://placehold.co/800x800?text=Course+2A', 1, '2026-02-01 14:54:50.870'),
(16, 3, 'https://placehold.co/800x800?text=Book+1A', 1, '2026-02-01 14:54:50.870'),
(17, 3, 'https://placehold.co/800x800?text=Book+1B', 2, '2026-02-01 14:54:50.870'),
(18, 532, '/uploads/products/book-532/Artboard-5-10.webp', 1, '2026-02-02 22:49:49.507'),
(19, 532, '/uploads/products/book-532/th-11134207-7ra0l-mb662quvsc4x3e.webp', 2, '2026-02-02 22:49:49.507'),
(20, 532, '/uploads/products/book-532/th-11134207-7qul4-lgvrmqaa7a44af.webp', 3, '2026-02-02 22:49:49.507'),
(21, 532, '/uploads/products/book-532/th-11134207-7qul3-lgvrmqaa5vjo12.webp', 4, '2026-02-02 22:49:49.507'),
(22, 532, '/uploads/products/book-532/th-11134207-7qul9-lgvrmqaa4gz834.webp', 5, '2026-02-02 22:49:49.507'),
(23, 532, '/uploads/products/book-532/th-11134207-7qul8-lgvrmqaa32es7f.webp', 6, '2026-02-02 22:49:49.507'),
(24, 532, '/uploads/products/book-532/th-11134207-7qul2-lgvrmqa9yupgb6.webp', 7, '2026-02-02 22:49:49.507'),
(25, 582, '/uploads/products/book-582/Artboard-5-7.webp', 1, '2026-02-02 22:49:49.507'),
(26, 582, '/uploads/products/book-582/th-11134207-7ra0n-mb7v4mfu09kkec.webp', 2, '2026-02-02 22:49:49.507'),
(27, 582, '/uploads/products/book-582/th-11134207-7rasi-maz0ueyj6xiu59.webp', 3, '2026-02-02 22:49:49.507'),
(28, 582, '/uploads/products/book-582/th-11134207-7rasg-maz0ujjwic8k7d.webp', 4, '2026-02-02 22:49:49.507'),
(29, 582, '/uploads/products/book-582/th-11134207-7rasd-maz0ure2zzue68.webp', 5, '2026-02-02 22:49:49.507'),
(30, 582, '/uploads/products/book-582/th-11134207-7rask-maz0v52kza5y26.webp', 6, '2026-02-02 22:49:49.507'),
(31, 582, '/uploads/products/book-582/th-11134207-7rasl-maz0v1qpuotye2.webp', 7, '2026-02-02 22:49:49.507'),
(32, 582, '/uploads/products/book-582/th-11134207-7ras9-maz0uw0a8s3a26.webp', 8, '2026-02-02 22:49:49.507'),
(33, 582, '/uploads/products/book-582/th-11134207-7qul4-lgvrmqa9w1kk8f.webp', 9, '2026-02-02 22:49:49.507'),
(34, 583, '/uploads/products/book-583/Artboard-5@1.5x-scaled.webp', 1, '2026-02-02 22:49:49.507'),
(35, 583, '/uploads/products/book-583/th-11134207-7ra0g-mb6i2eswyk508e.webp', 2, '2026-02-02 22:49:49.507'),
(36, 583, '/uploads/products/book-583/th-11134207-7ra0l-mb6i2eswyk3a7e.webp', 3, '2026-02-02 22:49:49.507'),
(37, 583, '/uploads/products/book-583/th-11134207-7ra0n-mb6i2eswzynq63.webp', 4, '2026-02-02 22:49:49.507'),
(38, 583, '/uploads/products/book-583/th-11134207-7ra0h-mb6i2esx1d86da.webp', 5, '2026-02-02 22:49:49.507'),
(39, 583, '/uploads/products/book-583/th-11134207-7ra0r-mb6i2esx1d9wfa.webp', 6, '2026-02-02 22:49:49.507'),
(40, 583, '/uploads/products/book-583/th-11134207-7ra0u-mb6i2eswzypg74.webp', 7, '2026-02-02 22:49:49.507'),
(41, 583, '/uploads/products/book-583/th-11134207-7ra0o-mb6i2esx2ruc44.webp', 8, '2026-02-02 22:49:49.507'),
(42, 584, '/uploads/products/book-584/Artboard-5NEW-scaled.webp', 1, '2026-02-02 22:49:49.507'),
(43, 584, '/uploads/products/book-584/th-11134207-7rasj-m45r0p8lzaa295.webp', 2, '2026-02-02 22:49:49.507'),
(44, 584, '/uploads/products/book-584/th-11134207-7ras9-m558gwmxv67e39.webp', 3, '2026-02-02 22:49:49.507'),
(45, 584, '/uploads/products/book-584/th-11134207-7rasg-m558gp6wret22b.webp', 4, '2026-02-02 22:49:49.507'),
(46, 584, '/uploads/products/book-584/th-11134207-7rasm-m558ghe46b6y83.webp', 5, '2026-02-02 22:49:49.507'),
(47, 584, '/uploads/products/book-584/0c512ed7def3fe4e86a50fa728eccf11.webp', 6, '2026-02-02 22:49:49.507'),
(48, 584, '/uploads/products/book-584/th-11134207-7rasb-m558fxr4ww1655.webp', 7, '2026-02-02 22:49:49.507'),
(49, 584, '/uploads/products/book-584/th-11134207-7rasa-m558fn7acreebb.webp', 8, '2026-02-02 22:49:49.507'),
(50, 584, '/uploads/products/book-584/7c0a41a66ae73a3ae38623bcbb6629d3.webp', 9, '2026-02-02 22:49:49.507'),
(51, 587, '/uploads/products/book-587/Artboard-5-9.webp', 1, '2026-02-02 22:49:49.507'),
(52, 587, '/uploads/products/book-587/th-11134207-7ra0r-mb66aoc60ry9f6.webp', 2, '2026-02-02 22:49:49.507'),
(53, 587, '/uploads/products/book-587/th-11134207-7ra0i-mb6jiwu54fapcb.webp', 3, '2026-02-02 22:49:49.507'),
(54, 587, '/uploads/products/book-587/th-11134207-7ra0s-mb6jix0suohd77.webp', 4, '2026-02-02 22:49:49.507'),
(55, 587, '/uploads/products/book-587/th-11134207-7ra0n-mb6jix2qru6925.webp', 5, '2026-02-02 22:49:49.507'),
(56, 587, '/uploads/products/book-587/th-11134207-7ra0m-mb6jiwtl6n3lc3.webp', 6, '2026-02-02 22:49:49.507'),
(57, 587, '/uploads/products/book-587/th-11134207-7ra0r-mb6jiws7jwqp7c.webp', 7, '2026-02-02 22:49:49.507'),
(58, 587, '/uploads/products/book-587/th-11134207-7ra0t-mb6jiwz4x46pbe.webp', 8, '2026-02-02 22:49:49.507'),
(59, 587, '/uploads/products/book-587/th-11134207-7ra0l-mb6jiws7ii69fc-1.webp', 9, '2026-02-02 22:49:49.507'),
(60, 589, '/uploads/products/book-589/Artboard-51.webp', 1, '2026-02-02 22:49:49.507'),
(61, 589, '/uploads/products/book-589/th-11134207-7ra0j-mb6aftwyampd1d.webp', 2, '2026-02-02 22:49:49.507'),
(62, 589, '/uploads/products/book-589/th-11134207-7ra0k-mb6itu583q7l73.webp', 3, '2026-02-02 22:49:49.507'),
(63, 589, '/uploads/products/book-589/th-11134207-7ra0k-mb6itu4e4y2943.webp', 4, '2026-02-02 22:49:49.507'),
(64, 589, '/uploads/products/book-589/th-11134207-7ra0i-mb6itu4e6cmp9f.webp', 5, '2026-02-02 22:49:49.507'),
(65, 589, '/uploads/products/book-589/th-11134207-7ra0p-mb6itu6m5wtt55.webp', 6, '2026-02-02 22:49:49.507'),
(66, 589, '/uploads/products/book-589/th-11134207-7ra0k-mb6itu583q8131.webp', 7, '2026-02-02 22:49:49.507'),
(67, 589, '/uploads/products/book-589/th-11134207-7ra0q-mb6itu445cox1a.webp', 8, '2026-02-02 22:49:49.507'),
(68, 589, '/uploads/products/book-589/th-11134207-7ra0o-mb6itu4e4y2p66.webp', 9, '2026-02-02 22:49:49.507'),
(69, 596, '/uploads/products/book-596/Artboard-5-16.webp', 1, '2026-02-02 22:49:49.507'),
(70, 596, '/uploads/products/book-596/th-11134207-7ra0k-mb6ah01kn8n579.webp', 2, '2026-02-02 22:49:49.507'),
(71, 596, '/uploads/products/book-596/th-11134207-7ra0u-mb6iy0m5wqd0fb.webp', 3, '2026-02-02 22:49:49.507'),
(72, 596, '/uploads/products/book-596/th-11134207-7ra0p-mb6iy0o3tw1ga1.webp', 4, '2026-02-02 22:49:49.507'),
(73, 596, '/uploads/products/book-596/th-11134207-7ra0s-mb6iy0ki1z78a8.webp', 5, '2026-02-02 22:49:49.507'),
(74, 596, '/uploads/products/book-596/th-11134207-7ra0p-mb6iy0m5wqba42.webp', 6, '2026-02-02 22:49:49.507'),
(75, 596, '/uploads/products/book-596/th-11134207-7ra0o-mb6iy0ki0kmsca.webp', 7, '2026-02-02 22:49:49.507'),
(76, 596, '/uploads/products/book-596/th-11134207-7ra0s-mb6iy0khz62cc2.webp', 8, '2026-02-02 22:49:49.507'),
(77, 632, '/uploads/products/book-632/Artboard-5-6.webp', 1, '2026-02-02 22:49:49.507'),
(78, 632, '/uploads/products/book-632/th-11134207-23030-4g0g3yjgbyovf0.webp', 2, '2026-02-02 22:49:49.507'),
(79, 632, '/uploads/products/book-632/th-11134207-23030-fz6a25lgbyova6.webp', 3, '2026-02-02 22:49:49.507'),
(80, 632, '/uploads/products/book-632/th-11134207-23030-bn803vogbyov5d.webp', 4, '2026-02-02 22:49:49.507'),
(81, 632, '/uploads/products/book-632/th-11134207-23030-vytyg8sgbyov14.webp', 5, '2026-02-02 22:49:49.507'),
(82, 632, '/uploads/products/book-632/th-11134207-7qukw-leo16lsygojicc.webp', 6, '2026-02-02 22:49:49.507'),
(83, 722, '/uploads/products/book-722/Artboard-5-12.webp', 1, '2026-02-02 22:49:49.507'),
(84, 722, '/uploads/products/book-722/th-11134207-7ra0j-mb66oubft0n581.webp', 2, '2026-02-02 22:49:49.507'),
(85, 722, '/uploads/products/book-722/th-11134207-7ra0j-mb6j6x0x0z9de1.webp', 3, '2026-02-02 22:49:49.507'),
(86, 722, '/uploads/products/book-722/th-11134207-7ra0n-mb6j6x0x2dttfe.webp', 4, '2026-02-02 22:49:49.507'),
(87, 722, '/uploads/products/book-722/th-11134207-7ra0t-mb6j6x6qsgap22.webp', 5, '2026-02-02 22:49:49.507'),
(88, 722, '/uploads/products/book-722/th-11134207-7ra0m-mb6j6x8z0fwhe2.webp', 6, '2026-02-02 22:49:49.507'),
(89, 722, '/uploads/products/book-722/th-11134207-7ra0t-mb6j6xbql5693b.webp', 7, '2026-02-02 22:49:49.507'),
(90, 722, '/uploads/products/book-722/th-11134207-7ra0m-mb6j6xdeiphdfd.webp', 8, '2026-02-02 22:49:49.507'),
(91, 730, '/uploads/products/book-730/Artboard-51-1.webp', 1, '2026-02-02 22:49:49.507'),
(92, 730, '/uploads/products/book-730/th-11134207-7ra0n-mb660iu8vssh0c.webp', 2, '2026-02-02 22:49:49.507'),
(93, 730, '/uploads/products/book-730/th-11134207-7ra0i-mb6jml0xoi9d57.webp', 3, '2026-02-02 22:49:49.507'),
(94, 730, '/uploads/products/book-730/th-11134207-7ra0k-mb6jml17o3nlf4.webp', 4, '2026-02-02 22:49:49.507'),
(95, 730, '/uploads/products/book-730/th-11134207-7ra0k-mb6jml0xoi9ta5.webp', 5, '2026-02-02 22:49:49.507'),
(96, 730, '/uploads/products/book-730/th-11134207-7ra0s-mb6jml1rnaf515.webp', 6, '2026-02-02 22:49:49.507'),
(97, 730, '/uploads/products/book-730/th-11134207-7rasf-m0jy4hlxghco31.webp', 7, '2026-02-02 22:49:49.507'),
(98, 730, '/uploads/products/book-730/th-11134207-7rask-m0jy5icvoi542a.webp', 8, '2026-02-02 22:49:49.507'),
(99, 730, '/uploads/products/book-730/th-11134207-7rasa-m0jy5nnhxk1m70.webp', 9, '2026-02-02 22:49:49.507'),
(100, 733, '/uploads/products/book-733/Artboard-5-11.webp', 1, '2026-02-02 22:49:49.507'),
(101, 733, '/uploads/products/book-733/th-11134207-7ra0o-mb66sglz27na87.webp', 2, '2026-02-02 22:49:49.507'),
(102, 733, '/uploads/products/book-733/th-11134207-7ra0p-mb6iepj130qp43.webp', 3, '2026-02-02 22:49:49.507'),
(103, 733, '/uploads/products/book-733/th-11134207-7ra0k-mb6iepg972wh06.webp', 4, '2026-02-02 22:49:49.507'),
(104, 733, '/uploads/products/book-733/th-11134207-7ra0n-mb6iepfp7w5d7f.webp', 5, '2026-02-02 22:49:49.507'),
(105, 733, '/uploads/products/book-733/th-11134207-7ra0p-mb6ieps70uwx48.webp', 6, '2026-02-02 22:49:49.507'),
(106, 733, '/uploads/products/book-733/th-11134207-7ra0m-mb6iepff9pc16c.webp', 7, '2026-02-02 22:49:49.507'),
(107, 733, '/uploads/products/book-733/th-11134207-7ra0g-mb6iepff8arl72.webp', 8, '2026-02-02 22:49:49.507'),
(108, 733, '/uploads/products/book-733/th-11134207-7ra0s-mb6iepfp7w4x87.webp', 9, '2026-02-02 22:49:49.507'),
(109, 742, '/uploads/products/book-742/Artboard-51-2.webp', 1, '2026-02-02 22:49:49.507'),
(110, 742, '/uploads/products/book-742/th-11134207-7ra0p-mb6776j1l8c469.webp', 2, '2026-02-02 22:49:49.507'),
(111, 742, '/uploads/products/book-742/th-11134207-7ra0j-mb6j45eete9t95.webp', 3, '2026-02-02 22:49:49.507'),
(112, 742, '/uploads/products/book-742/th-11134207-7ra0m-mb6j4545b88xb3.webp', 4, '2026-02-02 22:49:49.507'),
(113, 742, '/uploads/products/book-742/th-11134207-7ra0k-mb6j454p7lv5d7.webp', 5, '2026-02-02 22:49:49.507'),
(114, 742, '/uploads/products/book-742/th-11134207-7ra0n-mb6j45458f4194.webp', 6, '2026-02-02 22:49:49.507'),
(115, 742, '/uploads/products/book-742/th-11134207-7ra0q-mb6j45458f3l44.webp', 7, '2026-02-02 22:49:49.507'),
(116, 748, '/uploads/products/book-748/Artboard-5-1.webp', 1, '2026-02-02 22:49:49.507'),
(117, 748, '/uploads/products/book-748/th-11134207-7ra0m-mb67gx06pkl0e4.webp', 2, '2026-02-02 22:49:49.507'),
(118, 748, '/uploads/products/book-748/math-alevel-2.webp', 3, '2026-02-02 22:49:49.507'),
(119, 748, '/uploads/products/book-748/math-alevel-3.webp', 4, '2026-02-02 22:49:49.507'),
(120, 748, '/uploads/products/book-748/math-alevel-4.webp', 5, '2026-02-02 22:49:49.507'),
(121, 748, '/uploads/products/book-748/math-alevel-5.webp', 6, '2026-02-02 22:49:49.507'),
(122, 748, '/uploads/products/book-748/math-alevel-6.webp', 7, '2026-02-02 22:49:49.507'),
(123, 756, '/uploads/products/book-756/Artboard-5-3.webp', 1, '2026-02-02 22:49:49.507'),
(124, 756, '/uploads/products/book-756/th-11134207-7ra0o-mb67nyzh1fu9cc.webp', 2, '2026-02-02 22:49:49.507'),
(125, 756, '/uploads/products/book-756/eng-alevel-6.webp', 3, '2026-02-02 22:49:49.507'),
(126, 756, '/uploads/products/book-756/eng-alevel-5.webp', 4, '2026-02-02 22:49:49.507'),
(127, 756, '/uploads/products/book-756/eng-alevel-4.webp', 5, '2026-02-02 22:49:49.507'),
(128, 756, '/uploads/products/book-756/eng-alevel-3.webp', 6, '2026-02-02 22:49:49.507'),
(129, 756, '/uploads/products/book-756/eng-alevel-2.webp', 7, '2026-02-02 22:49:49.507'),
(130, 764, '/uploads/products/book-764/Artboard-5.webp', 1, '2026-02-02 22:49:49.507'),
(131, 764, '/uploads/products/book-764/th-11134207-7ra0q-mb67opf6cqkhc5.webp', 2, '2026-02-02 22:49:49.507'),
(132, 764, '/uploads/products/book-764/thai-social-7.webp', 3, '2026-02-02 22:49:49.507'),
(133, 764, '/uploads/products/book-764/thai-social-6.webp', 4, '2026-02-02 22:49:49.507'),
(134, 764, '/uploads/products/book-764/thai-social-5.webp', 5, '2026-02-02 22:49:49.507'),
(135, 764, '/uploads/products/book-764/thai-social-4.webp', 6, '2026-02-02 22:49:49.507'),
(136, 764, '/uploads/products/book-764/thai-social-3.webp', 7, '2026-02-02 22:49:49.507'),
(137, 764, '/uploads/products/book-764/thai-social-2.webp', 8, '2026-02-02 22:49:49.507'),
(138, 773, '/uploads/products/book-773/Artboard-5-8.webp', 1, '2026-02-02 22:49:49.507'),
(139, 773, '/uploads/products/book-773/th-11134207-7ra0h-mb67cnbjlvup48-1.webp', 2, '2026-02-02 22:49:49.507'),
(140, 773, '/uploads/products/book-773/th-11134207-7rasm-m1nnssbz5w8950.webp', 3, '2026-02-02 22:49:49.507'),
(141, 773, '/uploads/products/book-773/th-11134207-7rasi-m1nnssbzec530d.webp', 4, '2026-02-02 22:49:49.507'),
(142, 773, '/uploads/products/book-773/th-11134207-7rasa-m1nnssbz4hntbe.webp', 5, '2026-02-02 22:49:49.507'),
(143, 773, '/uploads/products/book-773/th-11134207-7rasm-m1nnssbzfqpjd6.webp', 6, '2026-02-02 22:49:49.507'),
(144, 774, '/uploads/products/book-774/Artboard-5-4.webp', 1, '2026-02-02 22:49:49.507'),
(145, 774, '/uploads/products/book-774/th-11134207-7ra0p-mb67w18iby4h70.webp', 2, '2026-02-02 22:49:49.507'),
(146, 774, '/uploads/products/book-774/physics-6.webp', 3, '2026-02-02 22:49:49.507'),
(147, 774, '/uploads/products/book-774/physics-5.webp', 4, '2026-02-02 22:49:49.507'),
(148, 774, '/uploads/products/book-774/physics-4.webp', 5, '2026-02-02 22:49:49.507'),
(149, 774, '/uploads/products/book-774/physics-3.webp', 6, '2026-02-02 22:49:49.507'),
(150, 774, '/uploads/products/book-774/physics-2.webp', 7, '2026-02-02 22:49:49.507'),
(151, 782, '/uploads/products/book-782/Artboard-5-5.webp', 1, '2026-02-02 22:49:49.507'),
(152, 782, '/uploads/products/book-782/chemistry-6.webp', 2, '2026-02-02 22:49:49.507'),
(153, 782, '/uploads/products/book-782/chemistry-5.webp', 3, '2026-02-02 22:49:49.507'),
(154, 782, '/uploads/products/book-782/chemistry-4.webp', 4, '2026-02-02 22:49:49.507'),
(155, 782, '/uploads/products/book-782/chemistry-3.webp', 5, '2026-02-02 22:49:49.507'),
(156, 782, '/uploads/products/book-782/chemistry-2.webp', 6, '2026-02-02 22:49:49.507'),
(157, 782, '/uploads/products/book-782/chemistry-1.webp', 7, '2026-02-02 22:49:49.507'),
(158, 782, '/uploads/products/book-782/th-11134207-7ra0h-mb67u4ncpapg18.webp', 8, '2026-02-02 22:49:49.507'),
(159, 791, '/uploads/products/book-791/Artboard-5-2.webp', 1, '2026-02-02 22:49:49.507'),
(160, 791, '/uploads/products/book-791/th-11134207-7ra0p-mb67l5z0uzauf9.webp', 2, '2026-02-02 22:49:49.507'),
(161, 791, '/uploads/products/book-791/th-11134207-7rash-m45j1afdab9m1b.webp', 3, '2026-02-02 22:49:49.507'),
(162, 791, '/uploads/products/book-791/th-11134207-7rasf-m45j1afdbpu2a5.webp', 4, '2026-02-02 22:49:49.507'),
(163, 791, '/uploads/products/book-791/th-11134207-7rasd-m45j1afdabwqe1.webp', 5, '2026-02-02 22:49:49.507'),
(164, 791, '/uploads/products/book-791/th-11134207-7rask-m45j1avgmrgq83.webp', 6, '2026-02-02 22:49:49.507'),
(165, 791, '/uploads/products/book-791/th-11134207-7rask-m45j1as4rnii50.webp', 7, '2026-02-02 22:49:49.507');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('student','admin') NOT NULL DEFAULT 'student',
  `profile_image_url` text DEFAULT NULL,
  `password_reset_token_hash` varchar(255) DEFAULT NULL,
  `password_reset_expires_at` datetime(3) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `verification_token_hash` varchar(255) DEFAULT NULL,
  `verification_token_expires_at` datetime(3) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `line_user_id` varchar(255) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  `phone_change_token_hash` varchar(255) DEFAULT NULL,
  `phone_change_token_expires_at` datetime(3) DEFAULT NULL,
  `email_login_count` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `role`, `profile_image_url`, `password_reset_token_hash`, `password_reset_expires_at`, `first_name`, `last_name`, `phone_number`, `is_verified`, `verification_token_hash`, `verification_token_expires_at`, `bio`, `line_user_id`, `created_at`, `updated_at`, `phone_change_token_hash`, `phone_change_token_expires_at`, `email_login_count`) VALUES
(1, 'kaewsiri@outlook.com', '$2b$12$VjUygcTyA1CJE4yiCilA2eImvXWtjAGr804PsbadIIHP..3ejC53e', 'student', 'http://apicourse.jknowledgetest.com/uploads/u1-1771242954879.png', NULL, NULL, 'Tom', 'Chakkrapan', '0830121275', 1, NULL, NULL, NULL, 'Uef3cf100d54678eb869a98ad6137661d', '2026-01-04 15:33:18.351', '2026-03-19 02:41:57.166', '3e787ba976ad8045799d40b2796a836a86bf03f93456420af08b810896c61f69', '2026-02-18 19:18:37.000', 0),
(2, 'jknowledgetutor@gmail.com', '$2b$12$VjUygcTyA1CJE4yiCilA2eImvXWtjAGr804PsbadIIHP..3ejC53e', 'student', NULL, NULL, NULL, 'Jknowledge', NULL, NULL, 0, NULL, NULL, NULL, NULL, '2025-01-15 17:20:20.000', '2025-01-15 17:20:20.000', NULL, NULL, 0),
(3, 'kiking.109@gmail.com', '$2b$12$VjUygcTyA1CJE4yiCilA2eImvXWtjAGr804PsbadIIHP..3ejC53e', 'student', NULL, NULL, NULL, 'ธนดล', 'ชัยเนตร', NULL, 0, NULL, NULL, NULL, NULL, '2025-04-22 02:12:37.000', '2025-04-22 02:12:37.000', NULL, NULL, 0),
(4, 'ktc59071@gmail.com', '$2b$12$VjUygcTyA1CJE4yiCilA2eImvXWtjAGr804PsbadIIHP..3ejC53e', 'student', NULL, NULL, NULL, 'tttt', 'oooo', NULL, 0, NULL, NULL, NULL, NULL, '2025-04-22 08:17:06.000', '2025-04-22 08:17:06.000', NULL, NULL, 0),
(5, 'jknowledgech@gmail.com', '$2b$12$VjUygcTyA1CJE4yiCilA2eImvXWtjAGr804PsbadIIHP..3ejC53e', 'student', NULL, NULL, NULL, 'sdfsdf', 'lnlkm', '0993831057', 1, NULL, NULL, NULL, NULL, '2025-04-23 08:05:50.000', '2026-02-17 04:32:00.059', NULL, NULL, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_admin_users_email` (`email`),
  ADD KEY `idx_admin_users_active` (`is_active`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_courses_slug` (`slug`),
  ADD UNIQUE KEY `uniq_courses_register_code` (`register_code`),
  ADD KEY `idx_courses_status` (`status`),
  ADD KEY `idx_courses_visibility` (`visibility_type`),
  ADD KEY `idx_courses_book_product` (`book_product_id`);

--
-- Indexes for table `course_progress`
--
ALTER TABLE `course_progress`
  ADD PRIMARY KEY (`user_id`,`course_id`),
  ADD KEY `fk_course_progress_course` (`course_id`);

--
-- Indexes for table `course_registrations`
--
ALTER TABLE `course_registrations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_course_registrations_course_created` (`course_id`,`created_at`,`id`),
  ADD KEY `idx_course_registrations_phone` (`phone_number`),
  ADD KEY `fk_course_registrations_user` (`user_id`);

--
-- Indexes for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_enrollments_user_course` (`user_id`,`course_id`),
  ADD KEY `idx_enrollments_course` (`course_id`),
  ADD KEY `idx_enrollments_user_enrolled_at` (`user_id`,`enrolled_at`,`id`);

--
-- Indexes for table `lessons`
--
ALTER TABLE `lessons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_lessons_public_id` (`public_id`),
  ADD UNIQUE KEY `uniq_lessons_module_slug` (`module_id`,`slug`),
  ADD KEY `idx_lessons_module_order` (`module_id`,`lesson_order`),
  ADD KEY `idx_lessons_module_active` (`module_id`,`is_active`);

--
-- Indexes for table `lesson_completions`
--
ALTER TABLE `lesson_completions`
  ADD PRIMARY KEY (`enrollment_id`,`lesson_id`),
  ADD KEY `idx_lesson_completions_lesson` (`lesson_id`),
  ADD KEY `idx_lesson_completions_enrollment_completed` (`enrollment_id`,`completed_at`);

--
-- Indexes for table `login_otp_requests`
--
ALTER TABLE `login_otp_requests`
  ADD PRIMARY KEY (`token`),
  ADD KEY `idx_login_otp_requests_phone_created` (`phone_number`,`created_at`),
  ADD KEY `idx_login_otp_requests_expires` (`expires_at`);

--
-- Indexes for table `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_modules_public_id` (`public_id`),
  ADD UNIQUE KEY `uniq_modules_course_order` (`course_id`,`module_order`),
  ADD KEY `idx_modules_course` (`course_id`);

--
-- Indexes for table `module_access`
--
ALTER TABLE `module_access`
  ADD PRIMARY KEY (`enrollment_id`,`module_id`),
  ADD KEY `idx_module_access_module` (`module_id`);

--
-- Indexes for table `otp_request_rate_limits`
--
ALTER TABLE `otp_request_rate_limits`
  ADD PRIMARY KEY (`phone_number`);

--
-- Indexes for table `shipping_orders`
--
ALTER TABLE `shipping_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_shipping_orders_tx_logistic` (`tx_logistic_id`),
  ADD UNIQUE KEY `uniq_shipping_orders_order` (`order_id`),
  ADD KEY `idx_shipping_orders_bill_code` (`bill_code`),
  ADD KEY `idx_shipping_orders_status` (`status`,`created_at`);

--
-- Indexes for table `shipping_tracking_events`
--
ALTER TABLE `shipping_tracking_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tracking_events_shipping_order` (`shipping_order_id`,`scan_time`),
  ADD KEY `idx_tracking_events_bill_code` (`bill_code`,`scan_time`);

--
-- Indexes for table `shop_banners`
--
ALTER TABLE `shop_banners`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_shop_banners_active` (`is_active`,`sort_order`,`id`);

--
-- Indexes for table `shop_coupons`
--
ALTER TABLE `shop_coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_shop_coupons_code` (`code`),
  ADD KEY `idx_shop_coupons_active` (`is_active`,`starts_at`,`ends_at`,`id`);

--
-- Indexes for table `shop_coupon_redemptions`
--
ALTER TABLE `shop_coupon_redemptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_shop_coupon_redemptions_order` (`coupon_id`,`order_id`),
  ADD KEY `idx_shop_coupon_redemptions_user` (`user_id`,`coupon_id`,`created_at`,`id`),
  ADD KEY `fk_shop_coupon_redemptions_order` (`order_id`);

--
-- Indexes for table `shop_orders`
--
ALTER TABLE `shop_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_shop_orders_public_id` (`public_id`),
  ADD UNIQUE KEY `uniq_shop_orders_gateway_ref` (`gateway`,`gateway_reference`),
  ADD KEY `idx_shop_orders_user` (`user_id`,`created_at`,`id`),
  ADD KEY `idx_shop_orders_status` (`status`,`created_at`,`id`),
  ADD KEY `idx_shop_orders_shipping` (`shipping_status`,`created_at`);

--
-- Indexes for table `shop_order_items`
--
ALTER TABLE `shop_order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_shop_order_items_order` (`order_id`);

--
-- Indexes for table `shop_products`
--
ALTER TABLE `shop_products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_shop_products_public_id` (`public_id`),
  ADD KEY `idx_shop_products_category` (`category`),
  ADD KEY `idx_shop_products_active` (`is_active`,`sort_order`,`id`);

--
-- Indexes for table `shop_product_images`
--
ALTER TABLE `shop_product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_shop_product_images_product` (`product_id`,`sort_order`,`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_users_email` (`email`),
  ADD UNIQUE KEY `uniq_users_line_user_id` (`line_user_id`),
  ADD KEY `idx_users_role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `course_registrations`
--
ALTER TABLE `course_registrations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27006;

--
-- AUTO_INCREMENT for table `enrollments`
--
ALTER TABLE `enrollments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25454;

--
-- AUTO_INCREMENT for table `lessons`
--
ALTER TABLE `lessons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7080;

--
-- AUTO_INCREMENT for table `modules`
--
ALTER TABLE `modules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=898;

--
-- AUTO_INCREMENT for table `shipping_orders`
--
ALTER TABLE `shipping_orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shipping_tracking_events`
--
ALTER TABLE `shipping_tracking_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shop_banners`
--
ALTER TABLE `shop_banners`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `shop_coupons`
--
ALTER TABLE `shop_coupons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `shop_coupon_redemptions`
--
ALTER TABLE `shop_coupon_redemptions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shop_orders`
--
ALTER TABLE `shop_orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `shop_order_items`
--
ALTER TABLE `shop_order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `shop_products`
--
ALTER TABLE `shop_products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=792;

--
-- AUTO_INCREMENT for table `shop_product_images`
--
ALTER TABLE `shop_product_images`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=166;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24670;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `course_registrations`
--
ALTER TABLE `course_registrations`
  ADD CONSTRAINT `fk_course_registrations_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_course_registrations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `shipping_orders`
--
ALTER TABLE `shipping_orders`
  ADD CONSTRAINT `fk_shipping_orders_order` FOREIGN KEY (`order_id`) REFERENCES `shop_orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `shipping_tracking_events`
--
ALTER TABLE `shipping_tracking_events`
  ADD CONSTRAINT `fk_tracking_events_shipping_order` FOREIGN KEY (`shipping_order_id`) REFERENCES `shipping_orders` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
