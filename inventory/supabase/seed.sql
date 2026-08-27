-- Seed data for Amity University Dubai Lab Software Inventory
-- NOTE: Sensitive data (passwords, login details) should be entered manually via the app.
-- This seed only contains non-sensitive catalog data.

-- ============================================
-- LABS
-- ============================================
INSERT INTO labs (name, description, hardware_specs) VALUES
  ('204', 'Design & Architecture Lab', 'Dell 13th Gen I9-13900 (32 CPU) 2.0GHz, 32GB RAM, RTX 4060, Windows 11 Pro 64-bit'),
  ('105', 'Computer Science Lab', 'Dell Pro 24 All in One QC24250, Intel Core Ultra 7 265 (20 CPUs) 2.4GHz, 16GB RAM, No GPU, Windows 11 Pro'),
  ('107', 'Engineering Lab', 'OptiPlex AIO 7410 65W, 13th Gen Core i5-13500 (20 CPUs) 2.5GHz, 8GB RAM, No GPU, Windows 10 Pro'),
  ('327', 'Advanced Design Lab', 'Dell 13th Gen I9-13900 (32 CPU) 2.0GHz, 32GB RAM, RTX 4060, Windows 11 Pro 64-bit'),
  ('Animation', 'Animation Lab', NULL),
  ('Media_Lab', 'Media Production Lab', NULL),
  ('Forensic Lab', 'Forensic / Cybersecurity Lab', NULL);

-- ============================================
-- VENDORS
-- ============================================
INSERT INTO vendors (name, address, contact_person, email, phone, website) VALUES
  ('GDSME', 'Office Suite 2010, SIT Tower, Dubai Silicon Oasis, Dubai, UAE', 'Shimray / Harikrishnan', 'Shimray@gdsmiddleeast.com', '971 45478080 / 971 543323751', NULL),
  ('FluidCodes', '901, Jumeirah Bay X2, Cluster X, JLT, Dubai, UAE', 'Fahim Raashid', 'fahim.r@fluidcodes.com', '971 56 489 2823', 'www.fluidcodes.com'),
  ('Visual Pro Solutions', NULL, NULL, 'shajal@visualprosolutions.com', '971 528921418', 'www.visualprosolutions.com'),
  ('Mediasys Dubai', 'Office #1114 Grosvenor Business Tower, Barsha Heights, Dubai, UAE', 'Sandip / Reena / Angel', 'sandip@mediasysdubai.com', '9714 450 3795 Ext 215 / 971 56 7917040', 'mediasysdubai.com'),
  ('SELECT International (SPSS)', '11-0 Aspin Commercial Tower, Trade Center First 335-117, Zayed Road, P.O. Box 231835, Dubai, UAE', 'Omar Salem', 'omar.salem@spss-me.com', '+971505774035', 'www.smartvision-me.com'),
  ('Autodesk Education', NULL, NULL, NULL, NULL, 'accounts.autodesk.com'),
  ('MediaLogic Dubai', 'DIAC, Dubai, UAE, PO Box 345019', NULL, 'sheethal@medialogicdubai.com', NULL, NULL);

-- ============================================
-- SOFTWARE (Paid)
-- ============================================
INSERT INTO software (name, license_type, notes, responsibility) VALUES
  ('Solidworks', 'paid', 'Server Based license configuration (172.16.22.2)', 'lab_assistant'),
  ('Ansys', 'paid', 'Server Based license configuration (172.16.20.16)', 'lab_assistant'),
  ('Chaos Enscape', 'paid', NULL, 'lab_assistant'),
  ('Chaos V-Ray', 'paid', NULL, 'lab_assistant'),
  ('CLO 3D', 'paid', NULL, 'lab_assistant'),
  ('SketchUp Studio', 'paid', NULL, 'lab_assistant'),
  ('Maxon ZBrush', 'paid', NULL, 'lab_assistant'),
  ('Maxon Cinema 4D', 'paid', NULL, 'lab_assistant'),
  ('MatLab', 'paid', 'Not renewing from 30-Jun-24 onwards', 'lab_assistant'),
  ('ProDiscover Academic', 'paid', 'Not renewing - no requirement', 'lab_assistant'),
  ('SPSS', 'paid', NULL, 'lab_assistant'),
  ('AutoCAD', 'paid', 'Educational Licence, yearly renewal via itsupport', 'it_team'),
  ('Adobe Creative Cloud', 'paid', 'India IT Team will take care', 'it_team'),
  ('ESET Endpoint Security', 'paid', 'IT Team will take care', 'it_team'),
  ('ESET Management Agent', 'paid', 'IT Team will take care', 'it_team'),
  ('Microsoft Office Professional Plus 2016', 'paid', 'IT Team will take care', 'it_team'),
  ('Lumion', 'paid', 'Remind to renew subscription every year', 'lab_assistant'),
  ('Pro Tools', 'paid', NULL, 'lab_assistant');

-- ============================================
-- SOFTWARE (Free - partial list, key ones)
-- ============================================
INSERT INTO software (name, license_type, download_link, notes, responsibility) VALUES
  ('7-Zip', 'free', 'https://www.7-zip.org/', NULL, 'lab_assistant'),
  ('Adobe Acrobat Reader', 'free', 'https://www.adobe.com/acrobat/pdf-reader.html', NULL, 'lab_assistant'),
  ('Android Studio', 'free', 'https://developer.android.com/studio', NULL, 'lab_assistant'),
  ('Apache NetBeans', 'free', 'https://netbeans.apache.org/', NULL, 'lab_assistant'),
  ('Arduino IDE', 'free', 'https://www.arduino.cc/en/software', NULL, 'lab_assistant'),
  ('Autodesk Maya', 'free', NULL, 'Educational license', 'lab_assistant'),
  ('Autodesk Revit', 'free', NULL, 'Educational license', 'lab_assistant'),
  ('Cisco Packet Tracer', 'free', 'https://www.netacad.com/cisco-packet-tracer', 'Requires Cisco NetAcad registration', 'lab_assistant'),
  ('DaVinci Resolve', 'free', 'https://www.blackmagicdesign.com/products/davinciresolve', NULL, 'lab_assistant'),
  ('Eclipse', 'free', 'https://www.eclipse.org/downloads/', NULL, 'lab_assistant'),
  ('Firefox', 'free', 'https://www.mozilla.org/en-US/firefox/new/', NULL, 'lab_assistant'),
  ('GNS3', 'free', 'https://www.gns3.com/software/download', NULL, 'lab_assistant'),
  ('Google Chrome', 'free', NULL, NULL, 'lab_assistant'),
  ('Microsoft Edge', 'free', NULL, NULL, 'lab_assistant'),
  ('Microsoft Visual Studio Code', 'free', 'https://code.visualstudio.com/', NULL, 'lab_assistant'),
  ('Notepad++', 'free', 'https://notepad-plus-plus.org/', NULL, 'lab_assistant'),
  ('Python', 'free', 'https://www.python.org/', NULL, 'lab_assistant'),
  ('VLC', 'free', 'https://www.videolan.org/vlc/', NULL, 'lab_assistant'),
  ('Epic Games Launcher', 'free', 'https://store.epicgames.com/', NULL, 'lab_assistant'),
  ('RStudio', 'free', 'https://posit.co/downloads/', NULL, 'lab_assistant'),
  ('Open Office', 'free', 'https://www.openoffice.org/', NULL, 'lab_assistant'),
  ('PyCharm CE', 'free', 'https://www.jetbrains.com/pycharm/', NULL, 'lab_assistant'),
  ('Turbo C++', 'free', NULL, NULL, 'lab_assistant'),
  ('MAMP', 'free', 'https://www.mamp.info/', NULL, 'lab_assistant'),
  ('Blackmagic RAW', 'free', 'https://www.blackmagicdesign.com/support/', NULL, 'lab_assistant'),
  ('DIALux', 'free', 'https://www.dialux.com/', 'Lighting design software', 'lab_assistant');

-- ============================================
-- LICENSES (Paid software tracking)
-- ============================================
INSERT INTO licenses (software_id, vendor_id, lab_names, num_licenses, expiration_date, renewal_date, notes) VALUES
  (1, 1, '107, 327', '60', '2026-07-01', '2026-07-01', NULL),
  (2, 2, '107, 327', '26', '2026-11-01', '2026-11-01', NULL),
  (3, 3, '204', '22', '2026-10-27', '2026-10-27', NULL),
  (4, 3, '204', '22', '2026-10-27', '2026-10-27', NULL),
  (5, NULL, '204', 'No Info', '2026-03-30', '2027-03-30', NULL),
  (6, 3, '204', '22', '2026-10-27', '2026-10-27', NULL),
  (7, 4, '204, Animation', '15', '2027-03-01', '2027-03-01', NULL),
  (8, 4, 'Media Lab, 204, 327', 'No Info', '2027-03-01', '2027-03-01', NULL),
  (9, NULL, '105', '39', '2024-06-30', '2024-06-30', 'Not renewing from 30-Jun-24'),
  (10, NULL, 'Forensic Lab', '20', '2025-04-01', '2025-04-01', 'Not renewing - no requirement'),
  (11, 5, '105', '15', '2028-08-30', '2028-08-30', '3 Qty 3-Year Subscription + 10 Qty'),
  (12, 6, 'All except Media Lab', '200', '2028-11-05', '2028-11-05', 'Educational Licence, yearly renewal'),
  (14, NULL, 'All Labs', NULL, '2026-12-31', NULL, 'IT Team will take care'),
  (15, NULL, 'All Labs', NULL, '2026-12-31', NULL, 'IT Team will take care'),
  (17, 7, '204', '24', '2027-03-01', '2027-03-01', 'Remind to renew subscription every year');
