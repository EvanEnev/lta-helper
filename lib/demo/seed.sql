insert into public.ranks (id, name, salary, overwork, permission_level, max_points, max_shift_points, weight, sorting_weight) values
  (1, 'Стажёр', 0, 0, 0, 0, 0, 1, 1),
  (2, 'Актёр', 0, 0, 0, 0, 0, 2, 2),
  (3, 'Железный', 1500, 300, 1, 10, 3, 3, 3),
  (4, 'Бронзовый', 1700, 300, 2, 10, 3, 4, 4),
  (5, 'Серебряный', 1900, 350, 3, 10, 3, 5, 5),
  (6, 'Золотой', 2100, 400, 4, 10, 3, 6, 6),
  (7, 'ОП', 2400, 450, 5, 10, 3, 7, 7),
  (8, 'Админ', 2600, 500, 6, 10, 3, 8, 8);

insert into public.locations (id, name, short_name, color, konsol_id, lat, lng, priority, can_issue) values
  (1, 'Убежище', 'уб', '#3b82f6', 101, 55.7558, 37.6176, 1, true),
  (2, 'Сити', 'ст', '#22c55e', 102, 55.8304, 37.5330, 2, true),
  (3, 'Джунгли', 'дж', '#f59e0b', 103, 55.6620, 37.6070, 3, true),
  (4, 'Дикий запад', 'дз', '#ec4899', 104, 55.7270, 37.4370, 4, false);

insert into public.workers (id, name, telegram_id, number, rank_id, location_id, phone_number, last_name, first_name, middle_name, email, is_former, balance, is_fired, auth_id, is_approved, lat, lng) values
  (1, 'Atlas', 900000001, 1, 5, 1, '+79990000001', 'Ivanov', 'Alex', 'Petrovich', 'worker1@example.com', false, 0, false, null, true, 55.76, 37.62),
  (2, 'Breeze', 900000002, 2, 6, 1, '+79990000002', 'Smith', 'Anna', 'Igorevna', 'worker2@example.com', false, 500, false, null, true, 55.75, 37.60),
  (3, 'Vortex', 900000003, 3, 4, 2, '+79990000003', 'Kuznetsov', 'Victor', 'Olegovich', 'worker3@example.com', false, 0, false, null, true, 55.83, 37.53),
  (4, 'Thunder', 900000004, 4, 3, 2, '+79990000004', 'Popov', 'Gleb', 'Sergeevich', 'worker4@example.com', false, 0, false, null, true, 55.84, 37.54),
  (5, 'Haze', 900000005, 5, 5, 3, '+79990000005', 'Lebedeva', 'Daria', 'Andreevna', 'worker5@example.com', false, 1000, false, null, true, 55.66, 37.61),
  (6, 'Echo', 900000006, 6, 4, 3, '+79990000006', 'Sokolov', 'Egor', 'Dmitrievich', 'worker6@example.com', false, 0, false, null, true, 55.67, 37.60),
  (7, 'Reaper', 900000007, 7, 3, 4, '+79990000007', 'Orlov', 'John', 'Pavlovich', 'worker7@example.com', false, 0, false, null, true, 55.73, 37.44),
  (8, 'Zephyr', 900000008, 8, 6, 4, '+79990000008', 'Volkova', 'Zoe', 'Romanovna', 'worker8@example.com', false, 0, false, null, true, 55.72, 37.43),
  (9, 'Demo Admin', 900000009, 9, 8, 1, '+79990000009', 'Admin', 'Demo', 'Demovich', 'demo@example.com', false, 0, false, 'demo-admin', true, 55.7558, 37.6176),
  (10, 'Spark', 900000010, 10, 7, 2, '+79990000010', 'Morozova', 'Irina', 'Lvovna', 'worker10@example.com', false, 0, false, null, true, 55.83, 37.53),
  (11, 'Cascade', 900000011, 11, 2, 1, '+79990000011', 'Novikov', 'Kirill', 'Maksimovich', 'actor1@example.com', false, 0, false, null, true, 55.75, 37.61),
  (12, 'Fox', 900000012, 12, 2, 2, '+79990000012', 'Fedorova', 'Lydia', 'Ilyinichna', 'actor2@example.com', false, 0, false, null, true, 55.83, 37.52),
  (13, 'Mirage', 900000013, 13, 2, 3, '+79990000013', 'Zaitsev', 'Michael', 'Artemovich', 'actor3@example.com', false, 0, false, null, true, 55.66, 37.60),
  (14, 'Neptune', 900000014, 14, 1, 1, '+79990000014', 'Tikhonov', 'Nick', 'Borisovich', 'intern1@example.com', false, 0, false, null, true, 55.76, 37.63),
  (15, 'Orion', 900000015, 15, 1, 2, '+79990000015', 'Belova', 'Olga', 'Timurovna', 'intern2@example.com', false, 0, false, null, true, 55.82, 37.54),
  (16, 'Ash', 900000016, 16, 3, 3, '+79990000016', 'Gusev', 'Paul', 'Evgenievich', 'worker16@example.com', true, 0, false, null, true, 55.65, 37.62);

insert into config.permissions (id, name, description) values
  (1, 'view_salary', 'View own salary'),
  (2, 'view_payrolls', 'View own payrolls'),
  (3, 'view_location_salary', 'View location salary'),
  (4, 'view_location_payrolls', 'View location payrolls'),
  (5, 'set_salary', 'Set shifts'),
  (6, 'edit_salary', 'Edit salary'),
  (7, 'set_location_schedule', 'Location schedule'),
  (8, 'view_full_salary', 'View all salaries'),
  (9, 'view_all_payrolls', 'View all payrolls'),
  (10, 'view_all_payments', 'View all payments'),
  (11, 'edit_payments', 'Edit payments'),
  (12, 'manage_internship', 'Manage internships'),
  (13, 'transfer_internship', 'Transfer trainees'),
  (14, 'admin', 'Administrator'),
  (15, 'edit_payrolls', 'Edit payrolls'),
  (16, 'issue_payrolls', 'Issue payrolls'),
  (17, 'edit_worker_rank', 'Change ranks'),
  (18, 'manage_permissions', 'Manage permissions');

insert into config.default_permissions (rank_id, permission_id) values
  (3, 1), (3, 2),
  (5, 3), (5, 4),
  (6, 5), (6, 6), (6, 7),
  (7, 8), (7, 9), (7, 10), (7, 11), (7, 12), (7, 13),
  (8, 14), (8, 15), (8, 16), (8, 17), (8, 18);

insert into config.dates (id, start_date, end_date) values
  (1, date_trunc('month', current_date)::date, (date_trunc('month', current_date) + interval '1 month - 1 day')::date),
  (2, date_trunc('month', current_date)::date, (date_trunc('month', current_date) + interval '1 month - 1 day')::date);

insert into config.admins (worker_id, location_id, date)
select (array[9, 2, 8, 10])[l], l, d + time '10:00'
from generate_series(current_date - 14, current_date + 14, interval '1 day') d, generate_series(1, 4) l;

insert into salary.types (id, name) values
  (1, 'Игры'),
  (2, 'Администрирование'),
  (3, 'Актёрская работа');

insert into salary.games_payments (id, description, value, name, rank, key, konsol_id) values
  (1, 'Игра для одной команды', 300, 'Одна игра', null, 'one', 201),
  (2, 'Две игры подряд', 550, 'Две игры', null, 'two', 202),
  (3, 'Три игры подряд', 800, 'Три игры', null, 'three', 203),
  (4, 'Актёрские игры', 400, 'Актёрские игры', 2, 'actor', 204);

insert into schedule.list (worker_id, date, value, comment)
select w.id, d::date, case when (w.id + extract(day from d)::int) % 7 = 0 then '-' when (w.id + extract(day from d)::int) % 5 = 0 then '+/-' else '+' end, null
from public.workers w, generate_series(date_trunc('month', current_date), date_trunc('month', current_date) + interval '1 month - 1 day', interval '1 day') d
where w.id <> 16;

insert into schedule.locations_schedule (location_id, worker_id, start_time, end_time, date)
select w.location_id, w.id, time '12:00', time '22:00', d::date
from public.workers w, generate_series(current_date - 14, current_date + 14, interval '1 day') d
where w.id <> 16 and (w.id + extract(day from d)::int) % 3 = 0;

insert into salary.list (worker_id, date, value, bonuses, fines, location_id, created_by, start_time, end_time, overwork_start, overwork_end, overwork, type, work_types, one_games, actor_games, is_confirmed)
select
  w.id,
  d::date,
  greatest(r.salary, 1000) + 500,
  case when (w.id + off) % 7 = 0 then '500' end,
  case when (w.id + off) % 11 = 0 then '-300' end,
  w.location_id,
  9,
  time '12:00',
  time '22:00',
  case when off % 5 = 0 then time '22:00' end,
  case when off % 5 = 0 then time '23:00' end,
  case when off % 5 = 0 then r.overwork end,
  case when w.rank_id = 2 then 'Актёрская работа' else 'Игры' end,
  case when w.rank_id = 2 then array[3] else array[1] end,
  case when w.rank_id <> 2 and off % 2 = 0 then '{"id": 1, "value": 600, "number": 2}'::jsonb end,
  case when w.rank_id = 2 then '{"id": 4, "value": 800, "number": 2}'::jsonb end,
  true
from public.workers w
join public.ranks r on r.id = w.rank_id
cross join lateral generate_series(0, 27) off
cross join lateral (select (current_date - off) as d) x
where w.id not in (14, 15, 16) and (w.id + off) % 3 = 0;

insert into payments.types (id, name, percent, ranks, value) values
  (1, 'Оф. труд.', null, null, null),
  (2, 'Самозанятость', null, null, null);

insert into payments.list (worker_id, payment_type, value, date, comment, paid) values
  (1, 1, 3000, current_date - 10, 'Advance', true),
  (2, 1, 2500, current_date - 9, 'Advance', true),
  (3, 2, 1500, current_date - 6, null, true),
  (5, 1, 2000, current_date - 4, 'Advance', true),
  (8, 2, 1000, current_date - 2, null, false);

insert into payrolls.list (id, dates, take_by, bonuses, created_by, is_published, meta) values
  (1, daterange((date_trunc('month', current_date) - interval '1 month')::date, date_trunc('month', current_date)::date), (date_trunc('month', current_date) + interval '5 days')::date, true, 9, true, '{}');

insert into payrolls.locations_money (location_id, payroll_id, value) values
  (1, 1, 30000), (2, 1, 25000), (3, 1, 25000), (4, 1, 20000);

insert into relations.workers_payrolls (worker_id, payroll_id, value, location_id, to_take_by, taken, taken_by, taken_at, bonuses, issue_confirmed, to_take, external_payment)
select
  w.id, 1, 8000 + w.id * 500, w.location_id, 9,
  case when w.id % 2 = 0 then 8000 + w.id * 500 end,
  case when w.id % 2 = 0 then 9 end,
  case when w.id % 2 = 0 then now() - interval '1 day' end,
  case when w.id % 3 = 0 then 500 end,
  w.id % 2 = 0,
  8000 + w.id * 500,
  0
from public.workers w
where w.id in (1, 2, 3, 4, 5, 6, 7, 8);

insert into ranks.requirements (id, name, description, "limit", type, category, rank_id, immutable, meta) values
  (1, 'Complete shifts', 'Number of shifts worked', 20, 'number', 'Experience', 4, false, '{"auto": true}'),
  (2, 'Pass the test', 'Rules knowledge test', null, 'check', 'Knowledge', 4, false, '{}'),
  (3, 'Complete shifts', 'Number of shifts worked', 40, 'number', 'Experience', 5, false, '{"auto": true}'),
  (4, 'Mentoring', 'Run an internship', null, 'check', 'Skills', 5, false, '{}');

insert into relations.workers_requirements (requirement_id, worker_id, value) values
  (1, 3, 14), (2, 3, 1), (1, 6, 18), (3, 1, 33), (3, 5, 40), (4, 5, 1);

insert into public.generations (id, name, description) values (1, 'First generation', 'Arena founders');
insert into relations.workers_generations (worker_id, generation_id) values (1, 1), (2, 1);

insert into internship.list (id, worker_id, curator_id, planned_days, started_at, closed_at, closed_by, result, summary) values
  (1, 14, 2, 4, current_date - 3, null, null, null, null),
  (2, 15, 1, 4, current_date - 20, now() - interval '15 days', 9, 'passed', 'Internship passed, ready for independent shifts.');

insert into internship.days (internship_id, date, strengths, weaknesses, to_learn, created_by) values
  (1, current_date - 3, 'Learns fast, polite with guests', 'Gets nervous at the start of a game', 'Scenario rules', 2),
  (1, current_date - 2, 'Runs the briefing well', 'Does not always watch the time', 'Game timing', 2),
  (2, current_date - 20, 'Knows the rules', 'Lacks confidence', 'Working with the cash desk', 1);

do $$
declare r record;
begin
  for r in
    select n.nspname, c.relname
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    join pg_attribute a on a.attrelid = c.oid and a.attname = 'id' and not a.attisdropped
    where c.relkind = 'r' and n.nspname in ('public', 'config', 'internship', 'payments', 'payrolls', 'points', 'ranks', 'relations', 'salary', 'schedule')
      and pg_get_serial_sequence(format('%I.%I', n.nspname, c.relname), 'id') is not null
  loop
    execute format(
      'select setval(pg_get_serial_sequence(%L, ''id''), greatest((select coalesce(max(id), 0) from %I.%I), 1))',
      format('%I.%I', r.nspname, r.relname), r.nspname, r.relname
    );
  end loop;
end $$;
