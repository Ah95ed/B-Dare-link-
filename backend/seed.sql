-- إدراج 10 مستخدمين
INSERT INTO users (id, email, password_hash, username, total_score, current_level_id, is_verified) VALUES
(1, 'test@test.com', '$2a$10$prsn7IoOqo18ADIAWBa7y.JVcmKek0KmgbzmN2qvTpN2wy9k4x98G', 'Test User', 1500, 5, 1),
(2, 'user2@test.com', '$2a$10$prsn7IoOqo18ADIAWBa7y.JVcmKek0KmgbzmN2qvTpN2wy9k4x98G', 'Player Two', 1200, 4, 1),
(3, 'user3@test.com', '$2a$10$prsn7IoOqo18ADIAWBa7y.JVcmKek0KmgbzmN2qvTpN2wy9k4x98G', 'Player Three', 900, 3, 1),
(4, 'user4@test.com', '$2a$10$prsn7IoOqo18ADIAWBa7y.JVcmKek0KmgbzmN2qvTpN2wy9k4x98G', 'Player Four', 2500, 10, 1),
(5, 'user5@test.com', '$2a$10$prsn7IoOqo18ADIAWBa7y.JVcmKek0KmgbzmN2qvTpN2wy9k4x98G', 'Player Five', 300, 2, 0),
(6, 'user6@test.com', '$2a$10$prsn7IoOqo18ADIAWBa7y.JVcmKek0KmgbzmN2qvTpN2wy9k4x98G', 'Player Six', 4500, 15, 1),
(7, 'user7@test.com', '$2a$10$prsn7IoOqo18ADIAWBa7y.JVcmKek0KmgbzmN2qvTpN2wy9k4x98G', 'Player Seven', 800, 3, 1),
(8, 'user8@test.com', '$2a$10$prsn7IoOqo18ADIAWBa7y.JVcmKek0KmgbzmN2qvTpN2wy9k4x98G', 'Player Eight', 1100, 4, 1),
(9, 'user9@test.com', '$2a$10$prsn7IoOqo18ADIAWBa7y.JVcmKek0KmgbzmN2qvTpN2wy9k4x98G', 'Player Nine', 600, 2, 0),
(10, 'user10@test.com', '$2a$10$prsn7IoOqo18ADIAWBa7y.JVcmKek0KmgbzmN2qvTpN2wy9k4x98G', 'Player Ten', 3400, 12, 1);

-- إدراج 8 ألغاز بنمط logical_chain
INSERT INTO puzzles (id, level, lang, json) VALUES
(1, 1, 'ar', '{"type":"logical_chain","difficulty":1,"startWord":"حليب","endWord":"زبدة","steps":[{"word":"خض","options":["خض","تسخين","تبريد","تجميد"]},{"word":"كريمة","options":["كريمة","ماء","سكر","ملح"]}],"hint":"فكّر في تحويل الحليب إلى منتج ألذ","puzzleId":"db-ar-l1-1"}'),
(2, 1, 'ar', '{"type":"logical_chain","difficulty":1,"startWord":"بذرة","endWord":"ثمرة","steps":[{"word":"زراعة","options":["زراعة","حصاد","طبخ","تخزين"]},{"word":"شجرة","options":["شجرة","حجر","بحر","نار"]},{"word":"زهرة","options":["زهرة","ورقة","جذر","غصن"]}],"hint":"دورة حياة النبات","puzzleId":"db-ar-l1-2"}'),
(3, 2, 'ar', '{"type":"logical_chain","difficulty":2,"startWord":"غابة","endWord":"كتاب","steps":[{"word":"شجرة","options":["شجرة","حجر","ماء","هواء"]},{"word":"خشب","options":["خشب","تراب","رمل","حديد"]},{"word":"ورق","options":["ورق","زجاج","بلاستيك","معدن"]},{"word":"طباعة","options":["طباعة","حرق","دفن","رمي"]}],"hint":"من الطبيعة إلى المعرفة","puzzleId":"db-ar-l2-1"}'),
(4, 2, 'ar', '{"type":"logical_chain","difficulty":2,"startWord":"سحاب","endWord":"قوس قزح","steps":[{"word":"مطر","options":["مطر","ثلج","برد","ضباب"]},{"word":"شمس","options":["شمس","قمر","نجم","كوكب"]},{"word":"انعكاس","options":["انعكاس","انكسار","امتصاص","انتشار"]},{"word":"ألوان","options":["ألوان","أصوات","روائح","أذواق"]}],"hint":"ظاهرة جميلة بعد المطر","puzzleId":"db-ar-l2-2"}'),
(5, 3, 'en', '{"type":"logical_chain","difficulty":3,"startWord":"water","endWord":"power","steps":[{"word":"dam","options":["dam","lake","river","ocean"]},{"word":"turbine","options":["turbine","wheel","boat","fish"]},{"word":"generator","options":["generator","battery","lamp","wire"]}],"hint":"Think about renewable energy","puzzleId":"db-en-l3-1"}'),
(6, 3, 'en', '{"type":"logical_chain","difficulty":3,"startWord":"sand","endWord":"chip","steps":[{"word":"silicon","options":["silicon","carbon","iron","gold"]},{"word":"wafer","options":["wafer","brick","wire","board"]}],"hint":"From beach to technology","puzzleId":"db-en-l3-2"}'),
(7, 4, 'ar', '{"type":"logical_chain","difficulty":4,"startWord":"فكرة","endWord":"شركة","steps":[{"word":"تخطيط","options":["تخطيط","تجاهل","نوم","لعب"]},{"word":"دراسة","options":["دراسة","سفر","رياضة","موسيقى"]},{"word":"تمويل","options":["تمويل","إنفاق","هدر","خسارة"]}],"hint":"رحلة ريادة الأعمال","puzzleId":"db-ar-l4-1"}'),
(8, 5, 'en', '{"type":"logical_chain","difficulty":5,"startWord":"atom","endWord":"planet","steps":[{"word":"molecule","options":["molecule","electron","proton","neutron"]},{"word":"cell","options":["cell","organ","tissue","system"]},{"word":"organism","options":["organism","bacteria","virus","fungus"]}],"hint":"From smallest to largest","puzzleId":"db-en-l5-1"}');

-- إدراج 10 تقدمات (Progress)
INSERT INTO progress (id, user_id, level, score, stars) VALUES
(1, 1, 1, 300, 3), (2, 1, 2, 250, 2),
(3, 2, 1, 300, 3), (4, 3, 1, 200, 1),
(5, 4, 1, 300, 3), (6, 4, 2, 300, 3), (7, 4, 3, 300, 3),
(8, 6, 1, 300, 3), (9, 7, 1, 280, 2), (10, 8, 1, 300, 3);

-- إدراج 10 مسابقات (Competitions)
INSERT INTO competitions (id, name, type, status, created_by) VALUES
(1, 'مسابقة الأبطال', 'global', 'active', 1),
(2, 'تحدي المعرفة', 'group', 'waiting', 2),
(3, 'بطولة العالم', 'global', 'finished', 4),
(4, 'المسابقة الرمضانية', 'global', 'active', 6),
(5, 'تحدي المدارس', 'group', 'waiting', 8),
(6, 'أسرع إجابة', 'global', 'active', 10),
(7, 'مسابقة الصيف', 'global', 'finished', 1),
(8, 'تحدي الأصدقاء', 'group', 'waiting', 3),
(9, 'مسابقة العلوم', 'group', 'active', 7),
(10, 'بطولة المبتدئين', 'global', 'waiting', 1);

-- إدراج 10 غرف (Rooms)
INSERT INTO rooms (id, name, code, competition_id, status, created_by) VALUES
(1, 'غرفة الأصدقاء', 'ROOMQ1', NULL, 'waiting', 1),
(2, 'غرفة التحدي', 'ROOMQ2', 2, 'active', 2),
(3, 'غرفة المحترفين', 'ROOMQ3', NULL, 'finished', 3),
(4, 'غرفة العائلة', 'ROOMQ4', NULL, 'waiting', 4),
(5, 'غرفة المدارس', 'ROOMQ5', 5, 'active', 5),
(6, 'غرفة الجامعات', 'ROOMQ6', NULL, 'waiting', 6),
(7, 'غرفة الأذكياء', 'ROOMQ7', 9, 'active', 7),
(8, 'غرفة المبتدئين', 'ROOMQ8', NULL, 'waiting', 8),
(9, 'غرفة المساء', 'ROOMQ9', 8, 'waiting', 9),
(10, 'غرفة النخبة', 'ROOMQ10', NULL, 'finished', 10);

-- إدراج 10 ألغاز الغرف (Room Puzzles)
INSERT INTO room_puzzles (id, room_id, puzzle_index, puzzle_json, solved_by) VALUES
(1, 2, 0, '{"question":"سؤال 1","options":["1","2","3","4"],"answer":0}', 1),
(2, 2, 1, '{"question":"سؤال 2","options":["1","2","3","4"],"answer":1}', 2),
(3, 3, 0, '{"question":"سؤال 1","options":["1","2","3","4"],"answer":0}', 3),
(4, 3, 1, '{"question":"سؤال 2","options":["1","2","3","4"],"answer":2}', 4),
(5, 5, 0, '{"question":"سؤال 1","options":["1","2","3","4"],"answer":3}', 5),
(6, 5, 1, '{"question":"سؤال 2","options":["1","2","3","4"],"answer":0}', 6),
(7, 7, 0, '{"question":"سؤال 1","options":["1","2","3","4"],"answer":1}', 7),
(8, 7, 1, '{"question":"سؤال 2","options":["1","2","3","4"],"answer":2}', NULL),
(9, 10, 0, '{"question":"سؤال 1","options":["1","2","3","4"],"answer":0}', 10),
(10, 10, 1, '{"question":"سؤال 2","options":["1","2","3","4"],"answer":0}', 1);

-- إدراج 10 سجلات للمشاركين في المسابقات (Competition Participants)
INSERT INTO competition_participants (id, competition_id, user_id, room_id) VALUES
(1, 1, 1, NULL), (2, 1, 2, NULL),
(3, 2, 1, 2), (4, 2, 2, 2),
(5, 3, 4, NULL), (6, 3, 5, NULL),
(7, 4, 6, NULL), (8, 4, 7, NULL),
(9, 5, 8, 5), (10, 5, 9, 5);

-- إدراج 10 مشاركين في الغرف (Room Participants)
INSERT INTO room_participants (id, room_id, user_id, role) VALUES
(1, 1, 1, 'manager'), (2, 1, 2, 'player'),
(3, 2, 2, 'manager'), (4, 2, 3, 'player'),
(5, 3, 3, 'manager'), (6, 3, 4, 'player'),
(7, 4, 4, 'manager'), (8, 4, 5, 'player'),
(9, 5, 5, 'manager'), (10, 5, 6, 'player');

-- إدراج 10 إعدادات للغرف (Room Settings)
INSERT INTO room_settings (id, room_id) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5),
(6, 6), (7, 7), (8, 8), (9, 9), (10, 10);

-- إدراج 10 تقارير (Puzzle Reports)
INSERT INTO puzzle_reports (id, room_id, puzzle_index, user_id, report_type) VALUES
(1, 2, 0, 1, 'bad_wording'),
(2, 2, 1, 2, 'wrong_answer'),
(3, 3, 0, 3, 'unclear'),
(4, 3, 1, 4, 'offensive'),
(5, 5, 0, 5, 'duplicate'),
(6, 5, 1, 6, 'other'),
(7, 7, 0, 7, 'bad_wording'),
(8, 7, 1, 8, 'wrong_answer'),
(9, 10, 0, 9, 'unclear'),
(10, 10, 1, 10, 'duplicate');

-- إدراج 10 نتائج للمسابقات (Competition Results)
INSERT INTO competition_results (id, competition_id, user_id, puzzle_id, puzzle_index, is_correct) VALUES
(1, 1, 1, 1, 0, 1), (2, 1, 1, 2, 1, 1),
(3, 1, 2, 1, 0, 1), (4, 1, 2, 2, 1, 0),
(5, 3, 4, 3, 0, 1), (6, 3, 4, 4, 1, 1),
(7, 3, 5, 3, 0, 0), (8, 3, 5, 4, 1, 1),
(9, 4, 6, 5, 0, 1), (10, 4, 6, 6, 1, 1);

-- إدراج 10 نتائج للغرف (Room Results)
INSERT INTO room_results (id, room_id, user_id, puzzle_id, puzzle_index, is_correct) VALUES
(1, 2, 1, 1, 0, 1), (2, 2, 1, 2, 1, 1),
(3, 2, 2, 1, 0, 1), (4, 2, 2, 2, 1, 0),
(5, 3, 3, 3, 0, 1), (6, 3, 3, 4, 1, 1),
(7, 3, 4, 3, 0, 0), (8, 3, 4, 4, 1, 1),
(9, 5, 5, 5, 0, 1), (10, 5, 5, 6, 1, 1);

-- إدراج 10 حركات للمدراء (Manager Actions)
INSERT INTO manager_actions (id, room_id, manager_user_id, action_type, target_user_id) VALUES
(1, 1, 1, 'freeze', 2),
(2, 1, 1, 'unfreeze', 2),
(3, 2, 2, 'skip_puzzle', NULL),
(4, 2, 2, 'kick', 3),
(5, 3, 3, 'change_difficulty', NULL),
(6, 4, 4, 'reset_scores', NULL),
(7, 5, 5, 'freeze', 6),
(8, 6, 6, 'change_settings', NULL),
(9, 7, 7, 'skip_puzzle', NULL),
(10, 8, 8, 'kick', 9);

-- إدراج 10 سجلات في تاريخ ألغاز الغرف (Room Puzzle History)
INSERT INTO room_puzzle_history (id, room_id, question_hash) VALUES
(1, 2, 'hash_q1'), (2, 2, 'hash_q2'),
(3, 3, 'hash_q3'), (4, 3, 'hash_q4'),
(5, 5, 'hash_q5'), (6, 5, 'hash_q6'),
(7, 7, 'hash_q7'), (8, 7, 'hash_q8'),
(9, 10, 'hash_q9'), (10, 10, 'hash_q10');
