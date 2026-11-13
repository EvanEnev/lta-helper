SET check_function_bodies = false;
--
-- PostgreSQL database dump
--


-- Dumped from database version 18.6 (Debian 18.6-1.pgdg13+2)
-- Dumped by pg_dump version 18.6


--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: config; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA config;


--
-- Name: functions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA functions;


--
-- Name: internship; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA internship;


--
-- Name: payments; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA payments;


--
-- Name: payrolls; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA payrolls;


--
-- Name: points; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA points;


--
-- Name: ranks; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA ranks;


--
-- Name: relations; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA relations;


--
-- Name: salary; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA salary;


--
-- Name: schedule; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA schedule;


--
--



--
--



--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
--



--
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


--
-- Name: eval(text); Type: FUNCTION; Schema: functions; Owner: -
--

CREATE FUNCTION functions.eval(_s text) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
declare i numeric;
begin
    execute format('select %s', _s) into i;
    return i;
end;
$$;


--
-- Name: get_balance(integer, date, date); Type: FUNCTION; Schema: functions; Owner: -
--

CREATE FUNCTION functions.get_balance(worker_id integer, start_date date, end_date date) RETURNS TABLE(incoming integer, outcoming integer)
    LANGUAGE plpgsql STABLE
    AS $$
declare
    v_date date = '2025-09-16';
begin
    return query
    select
        (s2.sum - p2.value - wp2.value)::integer as incoming,
        (s2.sum - p2.value - wp2.value + coalesce(s.sum, 0) - p.value - wp.value)::integer as outcoming
    from public.workers w
             left join lateral (
        select
            coalesce(sum(value), 0) as value
        from payments.list pl
        where pl.worker_id = w.id and
            pl.date < get_balance.start_date and pl.date >= v_date
        ) p2 on true
             left join lateral (
        select sum(s2.value) +
               sum(coalesce(s2.overwork, 0)) +
               sum(coalesce((s2.one_games ->> 'value')::integer, 0)) +
               sum(coalesce((s2.two_games ->> 'value')::integer, 0)) +
               sum(coalesce((s2.three_games ->> 'value')::integer, 0)) +
               sum(coalesce((s2.actor_games ->> 'value')::integer, 0)) +
               functions.eval(string_agg(s2.fines, '+')) +
               functions.eval(string_agg(s2.bonuses, '+')) as sum
        from salary.list s2 where s2.worker_id = get_balance.worker_id and s2.date < get_balance.start_date and s2.date >= v_date
        ) s2 on true
             left join lateral (
        select
            coalesce(sum(taken), 0) as value
        from relations.workers_payrolls wp2
        where wp2.worker_id = w.id and
            taken_at::date < get_balance.start_date
        ) wp2 on true
             left join lateral (
        select
            coalesce(sum(value), 0) as value
        from payments.list
        where payments.list.worker_id = w.id and
            date between get_balance.start_date and get_balance.end_date
        ) p on true
             left join lateral (
        select sum(s.value) +
               sum(coalesce(s.overwork, 0)) +
               sum(coalesce((s.one_games ->> 'value')::integer, 0)) +
               sum(coalesce((s.two_games ->> 'value')::integer, 0)) +
               sum(coalesce((s.three_games ->> 'value')::integer, 0)) +
               sum(coalesce((s.actor_games ->> 'value')::integer, 0)) +
               functions.eval(string_agg(s.fines, '+')) +
               functions.eval(string_agg(s.bonuses, '+')) as sum
        from salary.list s where s.worker_id = w.id and s.date between get_balance.start_date and get_balance.end_date
        ) s on true

        left join lateral (
            select functions.eval(string_agg(bonuses, '+')) + functions.eval(string_agg(fines, '+')) as value
            from salary.list s3 where s3.worker_id = w.id and date between '2025-08-01' and '2025-09-15' and w.rank_id != 12
        ) b on true

             left join lateral (
        select
            coalesce(sum(taken), 0) as value
        from relations.workers_payrolls wp
        where wp.worker_id = w.id and
            taken_at::date between get_balance.start_date and get_balance.end_date
        ) wp on true
    where w.id = get_balance.worker_id;
end;
$$;


--
-- Name: get_location(integer); Type: FUNCTION; Schema: functions; Owner: -
--

CREATE FUNCTION functions.get_location(location_id integer) RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
SELECT json_build_object(
               'id', l.id,
               'name', l.name,
               'color', l.color
       )
FROM locations l
WHERE l.id = get_location.location_id
$$;


--
-- Name: get_locations_salary(date); Type: FUNCTION; Schema: functions; Owner: -
--

CREATE FUNCTION functions.get_locations_salary(date date) RETURNS TABLE(location_id integer, type text, value integer, bonuses text, fines text)
    LANGUAGE sql STABLE
    AS $$
select
    s.location_id,
    s.type,
    sum(s.value) +
    sum(coalesce(s.overwork, 0)) +
    sum(coalesce((s.one_games ->> 'value')::integer, 0)) +
    sum(coalesce((s.two_games ->> 'value')::integer, 0)) +
    sum(coalesce((s.three_games ->> 'value')::integer, 0)) +
    sum(coalesce((s.actor_games ->> 'value')::integer, 0)) as value,
    string_agg(s.bonuses, '+') as bonuses,
    string_agg(s.fines, '+') as fines
from salary.list s
where s.date = get_locations_salary.date
and s.is_confirmed is true
group by s.location_id, s.type
$$;


--
-- Name: get_permissions(integer); Type: FUNCTION; Schema: functions; Owner: -
--

CREATE FUNCTION functions.get_permissions(worker_id integer) RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
SELECT
        jsonb_agg(
            jsonb_build_object(
                'id', pm.id,
                'name', pm.name,
                'description', pm.description
            )
        )
    FROM config.permissions pm
           LEFT JOIN workers w ON w.id = get_permissions.worker_id
           LEFT JOIN config.default_permissions dp ON (SELECT weight FROM ranks WHERE id = dp.rank_id) <= (SELECT weight FROM ranks WHERE id = w.rank_id)
           LEFT JOIN relations.workers_permissions w_pm ON w_pm.worker_id = w.id AND COALESCE(w_pm.expires > NOW(), true)
    WHERE
      pm.id = dp.permission_id
       OR pm.id = w_pm.permission_id
$$;


--
-- Name: get_rank(integer); Type: FUNCTION; Schema: functions; Owner: -
--

CREATE FUNCTION functions.get_rank(rank_id integer) RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
SELECT json_build_object(
               'id', r.id,
               'name', r.name,
               'weight', r.weight,
                'sortingWeight', r.sorting_weight
       )
FROM ranks r
WHERE r.id = get_rank.rank_id
$$;


--
-- Name: get_salary(integer, date, date, date, date); Type: FUNCTION; Schema: functions; Owner: -
--

CREATE FUNCTION functions.get_salary(worker_id integer, start_date date, end_date date, bonuses_start date, bonuses_end date) RETURNS TABLE(sum integer, value integer, overwork integer, games integer, one_games integer, two_games integer, three_games integer, actor_games integer, bonuses integer, fines integer, balance integer, external integer, of integer, self integer, taken integer, count integer)
    LANGUAGE sql STABLE
    AS $$
select
    sum(coalesce(s.value, 0)) +
    sum(coalesce(overwork, 0)) +
    sum(coalesce((s.one_games ->> 'value')::integer, 0)) +
    sum(coalesce((s.two_games ->> 'value')::integer, 0)) +
    sum(coalesce((s.three_games ->> 'value')::integer, 0)) +
    sum(coalesce((s.actor_games ->> 'value')::integer, 0)) +
    coalesce(b.bonuses, 0) +
    coalesce(b.fines, 0) +
    coalesce(w.balance, 0) -
    coalesce(p.value, 0) as sum,
    sum(coalesce(s.value, 0)) as value,
    sum(coalesce(overwork, 0)) as overwork,
    sum(coalesce((s.one_games ->> 'value')::integer, 0)) +
    sum(coalesce((s.two_games ->> 'value')::integer, 0)) +
    sum(coalesce((s.three_games ->> 'value')::integer, 0)) +
    sum(coalesce((s.actor_games ->> 'value')::integer, 0)) as games,
    sum(coalesce((s.one_games ->> 'value')::integer, 0)) as one_games,
    sum(coalesce((s.two_games ->> 'value')::integer, 0)) as two_games,
    sum(coalesce((s.three_games ->> 'value')::integer, 0)) as three_games,
    sum(coalesce((s.actor_games ->> 'value')::integer, 0)) as actor_games,
    coalesce(b.bonuses, 0) as bonuses,
    coalesce(b.fines, 0) as fines,
    coalesce(w.balance, 0) as balance,
    coalesce(p.value, 0) as external,
    coalesce(p1.value, 0) as of,
    coalesce(p2.value, 0) as self,
    coalesce(wp.value, 0) as taken,
    count(s.id) as count
from public.workers w
         left join lateral (
    select
        case when true
                 then functions.eval(string_agg(bonuses, '+'))
             else 0
            end as bonuses,
        case when true
                 then functions.eval(string_agg(fines, '+'))
             else 0
            end as fines
    from salary.list
    where salary.list.worker_id = w.id and
        date between  get_salary.bonuses_start and  get_salary.bonuses_end
      and salary.list.is_confirmed is true
    ) b on true
         left join lateral (
    select
        sum(value) as value
    from payments.list
    where payments.list.worker_id = w.id and
        date between get_salary.start_date and  get_salary.end_date
    ) p on true
         left join lateral (
    select
        sum(value) as value
    from payments.list
    where payments.list.worker_id = w.id and
        date between get_salary.start_date and  get_salary.end_date and payment_type = 1
    ) p1 on true
         left join lateral (
    select
        sum(value) as value
    from payments.list
    where payments.list.worker_id = w.id and
        date between get_salary.start_date and  get_salary.end_date and payment_type = 2
    ) p2 on true
         left join lateral (
    select
        sum(value) as value
    from relations.workers_payrolls
    where relations.workers_payrolls.worker_id = w.id and
        taken_at::date between get_salary.start_date and  get_salary.end_date
    ) wp on true
         left join salary.list s on s.worker_id = w.id and s.date between get_salary.start_date and get_salary.end_date and s.is_confirmed is true
where w.id = get_salary.worker_id
group by b.bonuses, b.fines, w.balance, p.value, p1.value, p2.value, wp.value
$$;


--
-- Name: get_salary(integer, date, date, date, date, integer[], integer[]); Type: FUNCTION; Schema: functions; Owner: -
--

CREATE FUNCTION functions.get_salary(worker_id integer, start_date date, end_date date, bonuses_start date, bonuses_end date, locations integer[], work_types integer[]) RETURNS TABLE(sum integer, value integer, overwork integer, games integer, one_games integer, two_games integer, three_games integer, actor_games integer, bonuses integer, fines integer, balance integer, external integer, of integer, self integer, taken integer, count integer)
    LANGUAGE sql STABLE
    AS $$
select
    sum(coalesce(s.value, 0)) +
    sum(coalesce(overwork, 0)) +
    sum(coalesce((s.one_games ->> 'value')::integer, 0)) +
    sum(coalesce((s.two_games ->> 'value')::integer, 0)) +
    sum(coalesce((s.three_games ->> 'value')::integer, 0)) +
    sum(coalesce((s.actor_games ->> 'value')::integer, 0)) +
    coalesce(b.bonuses, 0) +
    coalesce(b.fines, 0) +
    coalesce(w.balance, 0) -
    coalesce(p.value, 0) as sum,
    sum(coalesce(s.value, 0)) as value,
    sum(coalesce(overwork, 0)) as overwork,
    sum(coalesce((s.one_games ->> 'value')::integer, 0)) +
    sum(coalesce((s.two_games ->> 'value')::integer, 0)) +
    sum(coalesce((s.three_games ->> 'value')::integer, 0)) +
    sum(coalesce((s.actor_games ->> 'value')::integer, 0)) as games,
    sum(coalesce((s.one_games ->> 'value')::integer, 0)) as one_games,
    sum(coalesce((s.two_games ->> 'value')::integer, 0)) as two_games,
    sum(coalesce((s.three_games ->> 'value')::integer, 0)) as three_games,
    sum(coalesce((s.actor_games ->> 'value')::integer, 0)) as actor_games,
    coalesce(b.bonuses, 0) as bonuses,
    coalesce(b.fines, 0) as fines,
    coalesce(w.balance, 0) as balance,
    coalesce(p.value, 0) as external,
    coalesce(p1.value, 0) as of,
    coalesce(p2.value, 0) as self,
    coalesce(wp.value, 0) as taken,
    count(s.id) as count
from public.workers w
         left join lateral (
    select
        case when true
                 then functions.eval(string_agg(bonuses, '+'))
             else 0
            end as bonuses,
        case when true
                 then functions.eval(string_agg(fines, '+'))
             else 0
            end as fines
    from salary.list
    where salary.list.worker_id = w.id and
        date between  get_salary.bonuses_start and  get_salary.bonuses_end
      and salary.list.is_confirmed is true
      and salary.list.location_id = any(get_salary.locations)
--       and salary.list.work_types && get_salary.work_types
    ) b on true
         left join lateral (
    select
        sum(value) as value
    from payments.list
    where payments.list.worker_id = w.id and
        date between get_salary.start_date and  get_salary.end_date
             and (payments.list.payment_type != 2
--         or  (payments.list.payment_type = 2 
--                  and exists(select id from salary.list
--                                                         where date = payments.list.date and
--                                                             salary.list.worker_id = payments.list.worker_id
--         )
--                  )
                 )
    ) p on true
         left join lateral (
    select
        sum(value) as value
    from payments.list
    where payments.list.worker_id = w.id and
        date between get_salary.start_date and  get_salary.end_date and payment_type = 1
--       and (payments.list.payment_type != 2
--         or  (payments.list.payment_type = 2 and exists(select id from salary.list
--                    where date = payments.list.date and
--                        salary.list.worker_id = payments.list.worker_id
--         )
--             )
--         )
    ) p1 on true
         left join lateral (
    select
        sum(value) as value
    from payments.list
    where payments.list.worker_id = w.id and
        date between get_salary.start_date and  get_salary.end_date and payment_type = 2
--       and (payments.list.payment_type != 2
--         or  (payments.list.payment_type = 2 and exists(select id from salary.list
--                                                         where date = payments.list.date and
--                                                             salary.list.worker_id = payments.list.worker_id
--         )
--             )
--         )
    ) p2 on true
         left join lateral (
    select
        sum(value) as value
    from relations.workers_payrolls
    where relations.workers_payrolls.worker_id = w.id and
        taken_at::date between get_salary.start_date and  get_salary.end_date
    ) wp on true
         left join salary.list s on s.worker_id = w.id and s.date between get_salary.start_date and get_salary.end_date and s.location_id = any(get_salary.locations) and s.is_confirmed is true 
--                                         and s.work_types && get_salary.work_types

where w.id = get_salary.worker_id
group by b.bonuses, b.fines, w.balance, p.value, p1.value, p2.value, wp.value
$$;


--
-- Name: get_worker(integer); Type: FUNCTION; Schema: functions; Owner: -
--

CREATE FUNCTION functions.get_worker(worker_id integer) RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
SELECT json_build_object(
               'name', w.name,
               'id', w.id,
               'number', w.number,
               'telegramId', w.telegram_id,
               'isFormer', w.is_former,
               'location', l.name,
               'locationId', l.id,
               'rank', r.name,
               'firstName', w.first_name,
               'middleName', w.middle_name,
               'lastName', w.last_name,
               'phoneNumber', w.phone_number,
               'email', w.email,
               'photoUrl', w.photo_url,
               'todayLocation', admins.location_id
       )
FROM workers w
         LEFT JOIN ranks r ON r.id = w.rank_id
         LEFT JOIN locations l ON l.id = w.location_id
         LEFT JOIN (
    SELECT * FROM config.admins
    WHERE date::date = current_date
    order by date desc
    LIMIT 1
) admins ON admins.worker_id = w.id
WHERE w.id = get_worker.worker_id
$$;


--
-- Name: notify_salary_update(); Type: FUNCTION; Schema: functions; Owner: -
--

CREATE FUNCTION functions.notify_salary_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    payload JSON;
    worker_name TEXT;
    location_color TEXT;
    location_name TEXT;
    created_by TEXT;
BEGIN
    SELECT name INTO worker_name FROM workers WHERE id = NEW.worker_id;
    SELECT color INTO location_color FROM locations WHERE id = NEW.location_id;
    SELECT name INTO location_name FROM locations WHERE id = NEW.location_id;
    SELECT name INTO created_by FROM workers WHERE id = NEW.created_by;

    payload = json_build_object(
            'worker_name', worker_name,
            'worker_id', NEW.worker_id,
            'date', NEW.date,
            'value', NEW.value,
            'bonuses', NEW.bonuses,
            'fines', NEW.fines,
            'comment', NEW.comment,
            'created_at', NEW.created_at,
            'created_by', created_by,
            'start_time', NEW.start_time,
            'end_time', NEW.end_time,
            'overwork_start', NEW.overwork_start,
            'overwork_end', NEW.overwork_end,
            'overwork', NEW.overwork,
            'updated_by', NEW.updated_by,
            'location', json_build_object(
                    'color', location_color,
                    'name', location_name,
                    'id', NEW.location_id
                        )
              );
    PERFORM pg_notify('salary:update', payload::text);
    RETURN NEW;
END;
$$;


--
-- Name: notify_workers_payrolls_update(); Type: FUNCTION; Schema: functions; Owner: -
--

CREATE FUNCTION functions.notify_workers_payrolls_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    payload JSON;
    to_take_by TEXT;
    taken_by TEXT;
BEGIN
    select name into to_take_by from workers where id = NEW.to_take_by;
    select name into taken_by from workers where id = NEW.taken_by;

    payload = json_build_object(
            'worker_id', NEW.worker_id,
            'value', NEW.value,
            'bonuses', NEW.bonuses,
            'location_id', NEW.location_id,
            'to_take_by', to_take_by,
            'to_take', NEW.to_take,
            'issue_confirmed', NEW.issue_confirmed,
            'taken_by', taken_by,
            'taken', NEW.taken,
            'external_payment', NEW.external_payment,
            'taken_at', NEW.taken_at::text
              );
    PERFORM pg_notify('workers_payrolls:update', payload::text);
    RETURN NEW;
END;
$$;


--
-- Name: notify_workers_requirements_update(); Type: FUNCTION; Schema: functions; Owner: -
--

CREATE FUNCTION functions.notify_workers_requirements_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    payload JSON;
BEGIN
    payload = json_build_object(
            'workerId', NEW.worker_id,
            'value', NEW.value,
            'id', NEW.requirement_id,
            'oldWorkerId', OLD.worker_id,
              'oldId', OLD.requirement_id
              );
    PERFORM pg_notify('workers_requirements:update', payload::text);
    RETURN NEW;
END;
$$;




--
-- Name: account; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.account (
    id text NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" text NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp with time zone,
    "refreshTokenExpiresAt" timestamp with time zone,
    scope text,
    password text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: session; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.session (
    id text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    token text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" text NOT NULL,
    "impersonatedBy" text
);


--
-- Name: user; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth."user" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "emailVerified" boolean NOT NULL,
    image text,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role text,
    banned boolean,
    "banReason" text,
    "banExpires" timestamp with time zone
);


--
-- Name: verification; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.verification (
    id text NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: admins; Type: TABLE; Schema: config; Owner: -
--

CREATE TABLE config.admins (
    id integer NOT NULL,
    worker_id integer NOT NULL,
    location_id smallint NOT NULL,
    date timestamp without time zone NOT NULL
);


--
-- Name: admins_id_seq; Type: SEQUENCE; Schema: config; Owner: -
--

CREATE SEQUENCE config.admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: config; Owner: -
--

ALTER SEQUENCE config.admins_id_seq OWNED BY config.admins.id;


--
-- Name: dates; Type: TABLE; Schema: config; Owner: -
--

CREATE TABLE config.dates (
    id integer NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL
);


--
-- Name: dates_id_seq; Type: SEQUENCE; Schema: config; Owner: -
--

CREATE SEQUENCE config.dates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dates_id_seq; Type: SEQUENCE OWNED BY; Schema: config; Owner: -
--

ALTER SEQUENCE config.dates_id_seq OWNED BY config.dates.id;


--
-- Name: default_permissions; Type: TABLE; Schema: config; Owner: -
--

CREATE TABLE config.default_permissions (
    id integer NOT NULL,
    rank_id integer NOT NULL,
    permission_id integer NOT NULL
);


--
-- Name: default_permissions_id_seq; Type: SEQUENCE; Schema: config; Owner: -
--

CREATE SEQUENCE config.default_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: default_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: config; Owner: -
--

ALTER SEQUENCE config.default_permissions_id_seq OWNED BY config.default_permissions.id;


--
-- Name: permissions; Type: TABLE; Schema: config; Owner: -
--

CREATE TABLE config.permissions (
    id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL
);


--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: config; Owner: -
--

CREATE SEQUENCE config.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: config; Owner: -
--

ALTER SEQUENCE config.permissions_id_seq OWNED BY config.permissions.id;


--
-- Name: days; Type: TABLE; Schema: internship; Owner: -
--

CREATE TABLE internship.days (
    id integer NOT NULL,
    internship_id integer NOT NULL,
    date date NOT NULL,
    strengths text DEFAULT ''::text NOT NULL,
    weaknesses text DEFAULT ''::text NOT NULL,
    to_learn text DEFAULT ''::text NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: days_id_seq; Type: SEQUENCE; Schema: internship; Owner: -
--

CREATE SEQUENCE internship.days_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: days_id_seq; Type: SEQUENCE OWNED BY; Schema: internship; Owner: -
--

ALTER SEQUENCE internship.days_id_seq OWNED BY internship.days.id;


--
-- Name: list; Type: TABLE; Schema: internship; Owner: -
--

CREATE TABLE internship.list (
    id integer NOT NULL,
    worker_id integer NOT NULL,
    curator_id integer NOT NULL,
    planned_days integer DEFAULT 4 NOT NULL,
    started_at date DEFAULT CURRENT_DATE NOT NULL,
    closed_at timestamp with time zone,
    closed_by integer,
    result text,
    summary text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT list_check CHECK (((closed_at IS NULL) = (result IS NULL))),
    CONSTRAINT list_planned_days_check CHECK (((planned_days >= 1) AND (planned_days <= 60))),
    CONSTRAINT list_result_check CHECK ((result = ANY (ARRAY['passed'::text, 'failed'::text])))
);


--
-- Name: list_id_seq; Type: SEQUENCE; Schema: internship; Owner: -
--

CREATE SEQUENCE internship.list_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: list_id_seq; Type: SEQUENCE OWNED BY; Schema: internship; Owner: -
--

ALTER SEQUENCE internship.list_id_seq OWNED BY internship.list.id;


--
-- Name: list; Type: TABLE; Schema: payments; Owner: -
--

CREATE TABLE payments.list (
    id integer NOT NULL,
    worker_id integer NOT NULL,
    payment_type integer NOT NULL,
    value integer NOT NULL,
    date date NOT NULL,
    comment text,
    act_id integer,
    paid boolean
);


--
-- Name: list_id_seq; Type: SEQUENCE; Schema: payments; Owner: -
--

CREATE SEQUENCE payments.list_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: list_id_seq; Type: SEQUENCE OWNED BY; Schema: payments; Owner: -
--

ALTER SEQUENCE payments.list_id_seq OWNED BY payments.list.id;


--
-- Name: types; Type: TABLE; Schema: payments; Owner: -
--

CREATE TABLE payments.types (
    id integer NOT NULL,
    name text NOT NULL,
    percent integer,
    ranks integer[],
    value integer
);


--
-- Name: types_id_seq; Type: SEQUENCE; Schema: payments; Owner: -
--

CREATE SEQUENCE payments.types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: types_id_seq; Type: SEQUENCE OWNED BY; Schema: payments; Owner: -
--

ALTER SEQUENCE payments.types_id_seq OWNED BY payments.types.id;


--
-- Name: list; Type: TABLE; Schema: payrolls; Owner: -
--

CREATE TABLE payrolls.list (
    id integer NOT NULL,
    dates daterange NOT NULL,
    take_by date NOT NULL,
    bonuses boolean,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by integer NOT NULL,
    is_published boolean,
    meta jsonb
);


--
-- Name: list_id_seq; Type: SEQUENCE; Schema: payrolls; Owner: -
--

CREATE SEQUENCE payrolls.list_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: list_id_seq; Type: SEQUENCE OWNED BY; Schema: payrolls; Owner: -
--

ALTER SEQUENCE payrolls.list_id_seq OWNED BY payrolls.list.id;


--
-- Name: locations_money; Type: TABLE; Schema: payrolls; Owner: -
--

CREATE TABLE payrolls.locations_money (
    location_id integer,
    payroll_id integer,
    value integer
);


--
-- Name: list; Type: TABLE; Schema: points; Owner: -
--

CREATE TABLE points.list (
    id integer NOT NULL,
    name text NOT NULL,
    description text
);


--
-- Name: list_id_seq; Type: SEQUENCE; Schema: points; Owner: -
--

CREATE SEQUENCE points.list_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: list_id_seq; Type: SEQUENCE OWNED BY; Schema: points; Owner: -
--

ALTER SEQUENCE points.list_id_seq OWNED BY points.list.id;


--
-- Name: deals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deals (
    worker_id integer,
    deal_id integer,
    game_type text,
    date date,
    type text
);


--
-- Name: face_id; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.face_id (
    id integer NOT NULL,
    worker_id integer NOT NULL,
    location_id integer NOT NULL,
    date timestamp without time zone NOT NULL
);


--
-- Name: face_id_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.face_id_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: face_id_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.face_id_id_seq OWNED BY public.face_id.id;


--
-- Name: generations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.generations (
    id integer NOT NULL,
    name text NOT NULL,
    description text
);


--
-- Name: generations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.generations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: generations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.generations_id_seq OWNED BY public.generations.id;


--
-- Name: locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.locations (
    id smallint NOT NULL,
    name text NOT NULL,
    short_name text NOT NULL,
    color text DEFAULT '#'::text NOT NULL,
    konsol_id integer,
    old_color text,
    column_name text,
    lat double precision,
    lng double precision,
    priority integer,
    can_issue boolean
);


--
-- Name: locations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.locations_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.locations_id_seq OWNED BY public.locations.id;


--
-- Name: quests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quests (
    id integer NOT NULL,
    name text NOT NULL,
    description text
);


--
-- Name: quests_column_name_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.quests_column_name_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quests_column_name_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.quests_column_name_seq OWNED BY public.quests.id;


--
-- Name: ranks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ranks (
    id integer NOT NULL,
    name text,
    salary smallint,
    overwork smallint,
    permission_level smallint DEFAULT 0,
    max_points smallint,
    max_shift_points smallint,
    weight smallint NOT NULL,
    sorting_weight smallint
);


--
-- Name: ranks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ranks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ranks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ranks_id_seq OWNED BY public.ranks.id;


--
-- Name: workers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workers (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    telegram_id bigint,
    number integer,
    rank_id integer,
    location_id smallint,
    phone_number text,
    last_name character varying(255),
    first_name character varying(255),
    middle_name text,
    email text,
    is_former boolean,
    photo_url text,
    role text,
    balance integer,
    is_fired boolean,
    auth_id text,
    invited_by integer,
    is_approved boolean DEFAULT false,
    lat double precision,
    lng double precision
);


--
-- Name: workers_auth_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workers_auth_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workers_auth_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workers_auth_id_seq OWNED BY public.workers.auth_id;


--
-- Name: workers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workers_id_seq OWNED BY public.workers.id;


--
-- Name: requirements; Type: TABLE; Schema: ranks; Owner: -
--

CREATE TABLE ranks.requirements (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "limit" integer,
    type text NOT NULL,
    category text,
    rank_id integer,
    immutable boolean,
    meta jsonb,
    select_label integer,
    CONSTRAINT check_type CHECK (((type = 'check'::text) OR (type = 'number'::text) OR (type = 'select'::text)))
);


--
-- Name: requirements_id_seq; Type: SEQUENCE; Schema: ranks; Owner: -
--

CREATE SEQUENCE ranks.requirements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: requirements_id_seq; Type: SEQUENCE OWNED BY; Schema: ranks; Owner: -
--

ALTER SEQUENCE ranks.requirements_id_seq OWNED BY ranks.requirements.id;


--
-- Name: workers_requirements; Type: TABLE; Schema: relations; Owner: -
--

CREATE TABLE relations.workers_requirements (
    id integer NOT NULL,
    requirement_id integer,
    worker_id integer,
    value integer
);


--
-- Name: ranks_requirements_id_seq; Type: SEQUENCE; Schema: relations; Owner: -
--

CREATE SEQUENCE relations.ranks_requirements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ranks_requirements_id_seq; Type: SEQUENCE OWNED BY; Schema: relations; Owner: -
--

ALTER SEQUENCE relations.ranks_requirements_id_seq OWNED BY relations.workers_requirements.id;


--
-- Name: workers_generations; Type: TABLE; Schema: relations; Owner: -
--

CREATE TABLE relations.workers_generations (
    id integer NOT NULL,
    worker_id integer NOT NULL,
    generation_id integer NOT NULL
);


--
-- Name: workers_generations_id_seq; Type: SEQUENCE; Schema: relations; Owner: -
--

CREATE SEQUENCE relations.workers_generations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workers_generations_id_seq; Type: SEQUENCE OWNED BY; Schema: relations; Owner: -
--

ALTER SEQUENCE relations.workers_generations_id_seq OWNED BY relations.workers_generations.id;


--
-- Name: workers_notifications; Type: TABLE; Schema: relations; Owner: -
--

CREATE TABLE relations.workers_notifications (
    id integer NOT NULL,
    worker_id integer NOT NULL,
    data jsonb NOT NULL
);


--
-- Name: workers_notifications_id_seq; Type: SEQUENCE; Schema: relations; Owner: -
--

CREATE SEQUENCE relations.workers_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workers_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: relations; Owner: -
--

ALTER SEQUENCE relations.workers_notifications_id_seq OWNED BY relations.workers_notifications.id;


--
-- Name: workers_payrolls; Type: TABLE; Schema: relations; Owner: -
--

CREATE TABLE relations.workers_payrolls (
    id integer NOT NULL,
    worker_id integer NOT NULL,
    payroll_id integer NOT NULL,
    value integer NOT NULL,
    location_id smallint NOT NULL,
    to_take_by integer,
    taken integer,
    taken_by integer,
    taken_at timestamp without time zone,
    bonuses integer,
    issue_confirmed boolean,
    to_take integer,
    external_payment integer
);


--
-- Name: workers_payrolls_id_seq; Type: SEQUENCE; Schema: relations; Owner: -
--

CREATE SEQUENCE relations.workers_payrolls_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workers_payrolls_id_seq; Type: SEQUENCE OWNED BY; Schema: relations; Owner: -
--

ALTER SEQUENCE relations.workers_payrolls_id_seq OWNED BY relations.workers_payrolls.id;


--
-- Name: workers_permissions; Type: TABLE; Schema: relations; Owner: -
--

CREATE TABLE relations.workers_permissions (
    id integer NOT NULL,
    worker_id integer NOT NULL,
    permission_id integer NOT NULL,
    expires date
);


--
-- Name: workers_permissions_id_seq; Type: SEQUENCE; Schema: relations; Owner: -
--

CREATE SEQUENCE relations.workers_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workers_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: relations; Owner: -
--

ALTER SEQUENCE relations.workers_permissions_id_seq OWNED BY relations.workers_permissions.id;


--
-- Name: workers_quests; Type: TABLE; Schema: relations; Owner: -
--

CREATE TABLE relations.workers_quests (
    id integer NOT NULL,
    worker_id integer NOT NULL,
    quest_id integer NOT NULL
);


--
-- Name: workers_quests_id_seq; Type: SEQUENCE; Schema: relations; Owner: -
--

CREATE SEQUENCE relations.workers_quests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workers_quests_id_seq; Type: SEQUENCE OWNED BY; Schema: relations; Owner: -
--

ALTER SEQUENCE relations.workers_quests_id_seq OWNED BY relations.workers_quests.id;


--
-- Name: games_payments; Type: TABLE; Schema: salary; Owner: -
--

CREATE TABLE salary.games_payments (
    id integer NOT NULL,
    description text NOT NULL,
    value integer NOT NULL,
    name text NOT NULL,
    rank integer,
    key text,
    konsol_id integer
);


--
-- Name: games_payments_id_seq; Type: SEQUENCE; Schema: salary; Owner: -
--

CREATE SEQUENCE salary.games_payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: games_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: salary; Owner: -
--

ALTER SEQUENCE salary.games_payments_id_seq OWNED BY salary.games_payments.id;


--
-- Name: list; Type: TABLE; Schema: salary; Owner: -
--

CREATE TABLE salary.list (
    id integer NOT NULL,
    worker_id integer NOT NULL,
    date date DEFAULT now() NOT NULL,
    value integer NOT NULL,
    bonuses text,
    fines text,
    comment text,
    location_id smallint NOT NULL,
    created_at timestamp(0) without time zone DEFAULT now() NOT NULL,
    created_by integer NOT NULL,
    start_time time(6) without time zone NOT NULL,
    end_time time(6) without time zone NOT NULL,
    overwork_start time(6) without time zone,
    overwork_end time(6) without time zone,
    overwork smallint,
    updated_by integer,
    type text,
    work_types integer[],
    actor_games jsonb,
    three_games jsonb,
    two_games jsonb,
    one_games jsonb,
    task_id integer,
    is_confirmed boolean DEFAULT false
);


--
-- Name: list_id_seq; Type: SEQUENCE; Schema: salary; Owner: -
--

CREATE SEQUENCE salary.list_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: list_id_seq; Type: SEQUENCE OWNED BY; Schema: salary; Owner: -
--

ALTER SEQUENCE salary.list_id_seq OWNED BY salary.list.id;


--
-- Name: types; Type: TABLE; Schema: salary; Owner: -
--

CREATE TABLE salary.types (
    id integer NOT NULL,
    name text
);


--
-- Name: types_id_seq; Type: SEQUENCE; Schema: salary; Owner: -
--

CREATE SEQUENCE salary.types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: types_id_seq; Type: SEQUENCE OWNED BY; Schema: salary; Owner: -
--

ALTER SEQUENCE salary.types_id_seq OWNED BY salary.types.id;


--
-- Name: list; Type: TABLE; Schema: schedule; Owner: -
--

CREATE TABLE schedule.list (
    id integer NOT NULL,
    worker_id integer NOT NULL,
    date date NOT NULL,
    comment text,
    value text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: list_id_seq; Type: SEQUENCE; Schema: schedule; Owner: -
--

CREATE SEQUENCE schedule.list_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: list_id_seq; Type: SEQUENCE OWNED BY; Schema: schedule; Owner: -
--

ALTER SEQUENCE schedule.list_id_seq OWNED BY schedule.list.id;


--
-- Name: locations_schedule; Type: TABLE; Schema: schedule; Owner: -
--

CREATE TABLE schedule.locations_schedule (
    id integer NOT NULL,
    location_id smallint NOT NULL,
    worker_id integer NOT NULL,
    comment text,
    start_time time(6) without time zone,
    end_time time(6) without time zone,
    date date NOT NULL
);


--
-- Name: locations_schedule_id_seq; Type: SEQUENCE; Schema: schedule; Owner: -
--

CREATE SEQUENCE schedule.locations_schedule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: locations_schedule_id_seq; Type: SEQUENCE OWNED BY; Schema: schedule; Owner: -
--

ALTER SEQUENCE schedule.locations_schedule_id_seq OWNED BY schedule.locations_schedule.id;


--
-- Name: admins id; Type: DEFAULT; Schema: config; Owner: -
--

ALTER TABLE ONLY config.admins ALTER COLUMN id SET DEFAULT nextval('config.admins_id_seq'::regclass);


--
-- Name: dates id; Type: DEFAULT; Schema: config; Owner: -
--

ALTER TABLE ONLY config.dates ALTER COLUMN id SET DEFAULT nextval('config.dates_id_seq'::regclass);


--
-- Name: default_permissions id; Type: DEFAULT; Schema: config; Owner: -
--

ALTER TABLE ONLY config.default_permissions ALTER COLUMN id SET DEFAULT nextval('config.default_permissions_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: config; Owner: -
--

ALTER TABLE ONLY config.permissions ALTER COLUMN id SET DEFAULT nextval('config.permissions_id_seq'::regclass);


--
-- Name: days id; Type: DEFAULT; Schema: internship; Owner: -
--

ALTER TABLE ONLY internship.days ALTER COLUMN id SET DEFAULT nextval('internship.days_id_seq'::regclass);


--
-- Name: list id; Type: DEFAULT; Schema: internship; Owner: -
--

ALTER TABLE ONLY internship.list ALTER COLUMN id SET DEFAULT nextval('internship.list_id_seq'::regclass);


--
-- Name: list id; Type: DEFAULT; Schema: payments; Owner: -
--

ALTER TABLE ONLY payments.list ALTER COLUMN id SET DEFAULT nextval('payments.list_id_seq'::regclass);


--
-- Name: types id; Type: DEFAULT; Schema: payments; Owner: -
--

ALTER TABLE ONLY payments.types ALTER COLUMN id SET DEFAULT nextval('payments.types_id_seq'::regclass);


--
-- Name: list id; Type: DEFAULT; Schema: payrolls; Owner: -
--

ALTER TABLE ONLY payrolls.list ALTER COLUMN id SET DEFAULT nextval('payrolls.list_id_seq'::regclass);


--
-- Name: list id; Type: DEFAULT; Schema: points; Owner: -
--

ALTER TABLE ONLY points.list ALTER COLUMN id SET DEFAULT nextval('points.list_id_seq'::regclass);


--
-- Name: face_id id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.face_id ALTER COLUMN id SET DEFAULT nextval('public.face_id_id_seq'::regclass);


--
-- Name: generations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generations ALTER COLUMN id SET DEFAULT nextval('public.generations_id_seq'::regclass);


--
-- Name: locations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations ALTER COLUMN id SET DEFAULT nextval('public.locations_id_seq'::regclass);


--
-- Name: quests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quests ALTER COLUMN id SET DEFAULT nextval('public.quests_column_name_seq'::regclass);


--
-- Name: ranks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ranks ALTER COLUMN id SET DEFAULT nextval('public.ranks_id_seq'::regclass);


--
-- Name: workers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers ALTER COLUMN id SET DEFAULT nextval('public.workers_id_seq'::regclass);


--
-- Name: requirements id; Type: DEFAULT; Schema: ranks; Owner: -
--

ALTER TABLE ONLY ranks.requirements ALTER COLUMN id SET DEFAULT nextval('ranks.requirements_id_seq'::regclass);


--
-- Name: workers_generations id; Type: DEFAULT; Schema: relations; Owner: -
--

ALTER TABLE ONLY relations.workers_generations ALTER COLUMN id SET DEFAULT nextval('relations.workers_generations_id_seq'::regclass);


--
-- Name: workers_notifications id; Type: DEFAULT; Schema: relations; Owner: -
--

ALTER TABLE ONLY relations.workers_notifications ALTER COLUMN id SET DEFAULT nextval('relations.workers_notifications_id_seq'::regclass);


--
-- Name: workers_payrolls id; Type: DEFAULT; Schema: relations; Owner: -
--

ALTER TABLE ONLY relations.workers_payrolls ALTER COLUMN id SET DEFAULT nextval('relations.workers_payrolls_id_seq'::regclass);


--
-- Name: workers_permissions id; Type: DEFAULT; Schema: relations; Owner: -
--

ALTER TABLE ONLY relations.workers_permissions ALTER COLUMN id SET DEFAULT nextval('relations.workers_permissions_id_seq'::regclass);


--
-- Name: workers_quests id; Type: DEFAULT; Schema: relations; Owner: -
--

ALTER TABLE ONLY relations.workers_quests ALTER COLUMN id SET DEFAULT nextval('relations.workers_quests_id_seq'::regclass);


--
-- Name: workers_requirements id; Type: DEFAULT; Schema: relations; Owner: -
--

ALTER TABLE ONLY relations.workers_requirements ALTER COLUMN id SET DEFAULT nextval('relations.ranks_requirements_id_seq'::regclass);


--
-- Name: games_payments id; Type: DEFAULT; Schema: salary; Owner: -
--

ALTER TABLE ONLY salary.games_payments ALTER COLUMN id SET DEFAULT nextval('salary.games_payments_id_seq'::regclass);


--
-- Name: list id; Type: DEFAULT; Schema: salary; Owner: -
--

ALTER TABLE ONLY salary.list ALTER COLUMN id SET DEFAULT nextval('salary.list_id_seq'::regclass);


--
-- Name: types id; Type: DEFAULT; Schema: salary; Owner: -
--

ALTER TABLE ONLY salary.types ALTER COLUMN id SET DEFAULT nextval('salary.types_id_seq'::regclass);


--
-- Name: list id; Type: DEFAULT; Schema: schedule; Owner: -
--

ALTER TABLE ONLY schedule.list ALTER COLUMN id SET DEFAULT nextval('schedule.list_id_seq'::regclass);


--
-- Name: locations_schedule id; Type: DEFAULT; Schema: schedule; Owner: -
--

ALTER TABLE ONLY schedule.locations_schedule ALTER COLUMN id SET DEFAULT nextval('schedule.locations_schedule_id_seq'::regclass);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: session session_token_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.session
    ADD CONSTRAINT session_token_key UNIQUE (token);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: config; Owner: -
--

ALTER TABLE ONLY config.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: dates dates_pkey; Type: CONSTRAINT; Schema: config; Owner: -
--

ALTER TABLE ONLY config.dates
    ADD CONSTRAINT dates_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: config; Owner: -
--

ALTER TABLE ONLY config.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: default_permissions untitled_table_pkey; Type: CONSTRAINT; Schema: config; Owner: -
--

ALTER TABLE ONLY config.default_permissions
    ADD CONSTRAINT untitled_table_pkey PRIMARY KEY (rank_id, permission_id);


--
-- Name: admins worker_location_date_admins; Type: CONSTRAINT; Schema: config; Owner: -
--

ALTER TABLE ONLY config.admins
    ADD CONSTRAINT worker_location_date_admins UNIQUE (worker_id, location_id, date);


--
-- Name: days days_internship_id_date_key; Type: CONSTRAINT; Schema: internship; Owner: -
--

ALTER TABLE ONLY internship.days
    ADD CONSTRAINT days_internship_id_date_key UNIQUE (internship_id, date);


--
-- Name: days days_pkey; Type: CONSTRAINT; Schema: internship; Owner: -
--

ALTER TABLE ONLY internship.days
    ADD CONSTRAINT days_pkey PRIMARY KEY (id);


--
-- Name: list list_pkey; Type: CONSTRAINT; Schema: internship; Owner: -
--

ALTER TABLE ONLY internship.list
    ADD CONSTRAINT list_pkey PRIMARY KEY (id);


--
-- Name: list list_pk; Type: CONSTRAINT; Schema: payments; Owner: -
--

ALTER TABLE ONLY payments.list
    ADD CONSTRAINT list_pk UNIQUE (worker_id, act_id);


--
-- Name: list list_pkey; Type: CONSTRAINT; Schema: payments; Owner: -
--

ALTER TABLE ONLY payments.list
    ADD CONSTRAINT list_pkey PRIMARY KEY (id);


--
-- Name: types payments_types_pk; Type: CONSTRAINT; Schema: payments; Owner: -
--

ALTER TABLE ONLY payments.types
    ADD CONSTRAINT payments_types_pk PRIMARY KEY (id);


--
-- Name: list list_pk; Type: CONSTRAINT; Schema: payrolls; Owner: -
--

ALTER TABLE ONLY payrolls.list
    ADD CONSTRAINT list_pk UNIQUE (dates);


--
-- Name: list list_pkey; Type: CONSTRAINT; Schema: payrolls; Owner: -
--

ALTER TABLE ONLY payrolls.list
    ADD CONSTRAINT list_pkey PRIMARY KEY (id);


--
-- Name: locations_money locations_money_pk; Type: CONSTRAINT; Schema: payrolls; Owner: -
--

ALTER TABLE ONLY payrolls.locations_money
    ADD CONSTRAINT locations_money_pk UNIQUE (location_id, payroll_id);


--
-- Name: face_id face_id_pk_2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.face_id
    ADD CONSTRAINT face_id_pk_2 UNIQUE (location_id, worker_id, date);


--
-- Name: face_id face_id_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.face_id
    ADD CONSTRAINT face_id_pkey PRIMARY KEY (id);


--
-- Name: generations generations_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.generations
    ADD CONSTRAINT generations_pk UNIQUE (id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: quests quests_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quests
    ADD CONSTRAINT quests_pk UNIQUE (id);


--
-- Name: ranks ranks_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ranks
    ADD CONSTRAINT ranks_pk UNIQUE (id);


--
-- Name: ranks ranks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ranks
    ADD CONSTRAINT ranks_pkey PRIMARY KEY (id);


--
-- Name: workers workers_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_pk UNIQUE (name);


--
-- Name: workers workers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_pkey PRIMARY KEY (id);


--
-- Name: requirements requirements_pk; Type: CONSTRAINT; Schema: ranks; Owner: -
--

ALTER TABLE ONLY ranks.requirements
    ADD CONSTRAINT requirements_pk UNIQUE (id);


--
-- Name: workers_notifications workers_notifications_pk; Type: CONSTRAINT; Schema: relations; Owner: -
--

ALTER TABLE ONLY relations.workers_notifications
    ADD CONSTRAINT workers_notifications_pk UNIQUE (worker_id, data);


--
-- Name: workers_payrolls workers_payrolls_pk; Type: CONSTRAINT; Schema: relations; Owner: -
--

ALTER TABLE ONLY relations.workers_payrolls
    ADD CONSTRAINT workers_payrolls_pk UNIQUE (worker_id, payroll_id);


--
-- Name: workers_payrolls workers_payrolls_pkey; Type: CONSTRAINT; Schema: relations; Owner: -
--

ALTER TABLE ONLY relations.workers_payrolls
    ADD CONSTRAINT workers_payrolls_pkey PRIMARY KEY (id);


--
-- Name: workers_permissions workers_permissions_pkey; Type: CONSTRAINT; Schema: relations; Owner: -
--

ALTER TABLE ONLY relations.workers_permissions
    ADD CONSTRAINT workers_permissions_pkey PRIMARY KEY (id);


--
-- Name: workers_requirements workers_requirements_pk; Type: CONSTRAINT; Schema: relations; Owner: -
--

ALTER TABLE ONLY relations.workers_requirements
    ADD CONSTRAINT workers_requirements_pk UNIQUE (worker_id, requirement_id);


--
-- Name: games_payments games_payments_pk; Type: CONSTRAINT; Schema: salary; Owner: -
--

ALTER TABLE ONLY salary.games_payments
    ADD CONSTRAINT games_payments_pk PRIMARY KEY (id);


--
-- Name: list list_pkey; Type: CONSTRAINT; Schema: salary; Owner: -
--

ALTER TABLE ONLY salary.list
    ADD CONSTRAINT list_pkey PRIMARY KEY (id);


--
-- Name: list salary_worker_date_location; Type: CONSTRAINT; Schema: salary; Owner: -
--

ALTER TABLE ONLY salary.list
    ADD CONSTRAINT salary_worker_date_location UNIQUE (worker_id, date, location_id);


--
-- Name: types types_pkey; Type: CONSTRAINT; Schema: salary; Owner: -
--

ALTER TABLE ONLY salary.types
    ADD CONSTRAINT types_pkey PRIMARY KEY (id);


--
-- Name: list date_worker; Type: CONSTRAINT; Schema: schedule; Owner: -
--

ALTER TABLE ONLY schedule.list
    ADD CONSTRAINT date_worker UNIQUE (worker_id, date);


--
-- Name: list list_pkey; Type: CONSTRAINT; Schema: schedule; Owner: -
--

ALTER TABLE ONLY schedule.list
    ADD CONSTRAINT list_pkey PRIMARY KEY (id);


--
-- Name: locations_schedule locations_schedule_pkey; Type: CONSTRAINT; Schema: schedule; Owner: -
--

ALTER TABLE ONLY schedule.locations_schedule
    ADD CONSTRAINT locations_schedule_pkey PRIMARY KEY (id);


--
-- Name: locations_schedule worker_date_location; Type: CONSTRAINT; Schema: schedule; Owner: -
--

ALTER TABLE ONLY schedule.locations_schedule
    ADD CONSTRAINT worker_date_location UNIQUE (date, location_id, worker_id);


--
-- Name: internship_one_active_per_worker; Type: INDEX; Schema: internship; Owner: -
--

CREATE UNIQUE INDEX internship_one_active_per_worker ON internship.list USING btree (worker_id) WHERE (closed_at IS NULL);


--
-- Name: ranks_name_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ranks_name_unique ON public.ranks USING btree (name);


--
-- Name: workers_permissions_index_2; Type: INDEX; Schema: relations; Owner: -
--

CREATE UNIQUE INDEX workers_permissions_index_2 ON relations.workers_permissions USING btree (worker_id, permission_id, expires);


--
-- Name: workers_payrolls workers_payrolls_updates; Type: TRIGGER; Schema: relations; Owner: -
--

CREATE TRIGGER workers_payrolls_updates AFTER UPDATE ON relations.workers_payrolls FOR EACH ROW EXECUTE FUNCTION functions.notify_workers_payrolls_update();


--
-- Name: workers_requirements workers_requirements_update_trigger; Type: TRIGGER; Schema: relations; Owner: -
--

CREATE TRIGGER workers_requirements_update_trigger AFTER INSERT OR DELETE OR UPDATE ON relations.workers_requirements FOR EACH ROW EXECUTE FUNCTION functions.notify_workers_requirements_update();


--
-- Name: list salary_update_trigger; Type: TRIGGER; Schema: salary; Owner: -
--

CREATE TRIGGER salary_update_trigger AFTER UPDATE ON salary.list FOR EACH ROW EXECUTE FUNCTION functions.notify_salary_update();


--
-- Name: account account_userId_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.account
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES auth."user"(id) ON DELETE CASCADE;


--
-- Name: session session_userId_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.session
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES auth."user"(id) ON DELETE CASCADE;


--
-- Name: default_permissions default_permissions_relation_1; Type: FK CONSTRAINT; Schema: config; Owner: -
--

ALTER TABLE ONLY config.default_permissions
    ADD CONSTRAINT default_permissions_relation_1 FOREIGN KEY (rank_id) REFERENCES public.ranks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: default_permissions default_permissions_relation_2; Type: FK CONSTRAINT; Schema: config; Owner: -
--

ALTER TABLE ONLY config.default_permissions
    ADD CONSTRAINT default_permissions_relation_2 FOREIGN KEY (permission_id) REFERENCES config.permissions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: days days_created_by_fkey; Type: FK CONSTRAINT; Schema: internship; Owner: -
--

ALTER TABLE ONLY internship.days
    ADD CONSTRAINT days_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.workers(id);


--
-- Name: days days_internship_id_fkey; Type: FK CONSTRAINT; Schema: internship; Owner: -
--

ALTER TABLE ONLY internship.days
    ADD CONSTRAINT days_internship_id_fkey FOREIGN KEY (internship_id) REFERENCES internship.list(id) ON DELETE CASCADE;


--
-- Name: list list_closed_by_fkey; Type: FK CONSTRAINT; Schema: internship; Owner: -
--

ALTER TABLE ONLY internship.list
    ADD CONSTRAINT list_closed_by_fkey FOREIGN KEY (closed_by) REFERENCES public.workers(id);


--
-- Name: list list_curator_id_fkey; Type: FK CONSTRAINT; Schema: internship; Owner: -
--

ALTER TABLE ONLY internship.list
    ADD CONSTRAINT list_curator_id_fkey FOREIGN KEY (curator_id) REFERENCES public.workers(id);


--
-- Name: list list_worker_id_fkey; Type: FK CONSTRAINT; Schema: internship; Owner: -
--

ALTER TABLE ONLY internship.list
    ADD CONSTRAINT list_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: locations_money locations_money_list_id_fk; Type: FK CONSTRAINT; Schema: payrolls; Owner: -
--

ALTER TABLE ONLY payrolls.locations_money
    ADD CONSTRAINT locations_money_list_id_fk FOREIGN KEY (payroll_id) REFERENCES payrolls.list(id) ON UPDATE CASCADE;


--
-- Name: locations_money locations_money_locations_id_fk; Type: FK CONSTRAINT; Schema: payrolls; Owner: -
--

ALTER TABLE ONLY payrolls.locations_money
    ADD CONSTRAINT locations_money_locations_id_fk FOREIGN KEY (location_id) REFERENCES public.locations(id) ON UPDATE CASCADE;


--
-- Name: list payrolls_workers_id_fk; Type: FK CONSTRAINT; Schema: payrolls; Owner: -
--

ALTER TABLE ONLY payrolls.list
    ADD CONSTRAINT payrolls_workers_id_fk FOREIGN KEY (created_by) REFERENCES public.workers(id);


--
-- Name: face_id face_id_locations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.face_id
    ADD CONSTRAINT face_id_locations_id_fk FOREIGN KEY (location_id) REFERENCES public.locations(id);


--
-- Name: face_id face_id_workers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.face_id
    ADD CONSTRAINT face_id_workers_id_fk FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: workers worker_location; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT worker_location FOREIGN KEY (location_id) REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: workers workers_ranks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workers
    ADD CONSTRAINT workers_ranks_id_fk FOREIGN KEY (rank_id) REFERENCES public.ranks(id);


--
-- Name: requirements requirements_ranks_id_fk; Type: FK CONSTRAINT; Schema: ranks; Owner: -
--

ALTER TABLE ONLY ranks.requirements
    ADD CONSTRAINT requirements_ranks_id_fk FOREIGN KEY (rank_id) REFERENCES public.ranks(id);


--
-- Name: workers_payrolls fk_workers_payrolls_locations_location_id; Type: FK CONSTRAINT; Schema: relations; Owner: -
--

ALTER TABLE ONLY relations.workers_payrolls
    ADD CONSTRAINT fk_workers_payrolls_locations_location_id FOREIGN KEY (location_id) REFERENCES public.locations(id) ON UPDATE CASCADE;


--
-- Name: workers_payrolls fk_workers_payrolls_payrolls_payroll_id; Type: FK CONSTRAINT; Schema: relations; Owner: -
--

ALTER TABLE ONLY relations.workers_payrolls
    ADD CONSTRAINT fk_workers_payrolls_payrolls_payroll_id FOREIGN KEY (payroll_id) REFERENCES payrolls.list(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workers_payrolls fk_workers_payrolls_workers_taken_by; Type: FK CONSTRAINT; Schema: relations; Owner: -
--

ALTER TABLE ONLY relations.workers_payrolls
    ADD CONSTRAINT fk_workers_payrolls_workers_taken_by FOREIGN KEY (taken_by) REFERENCES public.workers(id) ON UPDATE CASCADE;


--
-- Name: workers_payrolls fk_workers_payrolls_workers_to_take_by; Type: FK CONSTRAINT; Schema: relations; Owner: -
--

ALTER TABLE ONLY relations.workers_payrolls
    ADD CONSTRAINT fk_workers_payrolls_workers_to_take_by FOREIGN KEY (to_take_by) REFERENCES public.workers(id) ON UPDATE CASCADE;


--
-- Name: workers_payrolls fk_workers_payrolls_workers_worker_id; Type: FK CONSTRAINT; Schema: relations; Owner: -
--

ALTER TABLE ONLY relations.workers_payrolls
    ADD CONSTRAINT fk_workers_payrolls_workers_worker_id FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON UPDATE CASCADE;


--
-- Name: workers_generations workers_generations_generations_id_fk; Type: FK CONSTRAINT; Schema: relations; Owner: -
--

ALTER TABLE ONLY relations.workers_generations
    ADD CONSTRAINT workers_generations_generations_id_fk FOREIGN KEY (generation_id) REFERENCES public.generations(id);


--
-- Name: workers_generations workers_generations_workers_id_fk; Type: FK CONSTRAINT; Schema: relations; Owner: -
--

ALTER TABLE ONLY relations.workers_generations
    ADD CONSTRAINT workers_generations_workers_id_fk FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: workers_notifications workers_notifications_workers_id_fk; Type: FK CONSTRAINT; Schema: relations; Owner: -
--

ALTER TABLE ONLY relations.workers_notifications
    ADD CONSTRAINT workers_notifications_workers_id_fk FOREIGN KEY (worker_id) REFERENCES public.workers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: workers_permissions workers_permissions_workers_id_fk; Type: FK CONSTRAINT; Schema: relations; Owner: -
--

ALTER TABLE ONLY relations.workers_permissions
    ADD CONSTRAINT workers_permissions_workers_id_fk FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: workers_quests workers_quests_quests_id_fk; Type: FK CONSTRAINT; Schema: relations; Owner: -
--

ALTER TABLE ONLY relations.workers_quests
    ADD CONSTRAINT workers_quests_quests_id_fk FOREIGN KEY (quest_id) REFERENCES public.quests(id);


--
-- Name: workers_quests workers_quests_workers_id_fk; Type: FK CONSTRAINT; Schema: relations; Owner: -
--

ALTER TABLE ONLY relations.workers_quests
    ADD CONSTRAINT workers_quests_workers_id_fk FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: workers_requirements workers_requirements_requirements_id_fk; Type: FK CONSTRAINT; Schema: relations; Owner: -
--

ALTER TABLE ONLY relations.workers_requirements
    ADD CONSTRAINT workers_requirements_requirements_id_fk FOREIGN KEY (requirement_id) REFERENCES ranks.requirements(id);


--
-- Name: workers_requirements workers_requirements_workers_id_fk; Type: FK CONSTRAINT; Schema: relations; Owner: -
--

ALTER TABLE ONLY relations.workers_requirements
    ADD CONSTRAINT workers_requirements_workers_id_fk FOREIGN KEY (worker_id) REFERENCES public.workers(id);


--
-- Name: games_payments games_payments_ranks_id_fk; Type: FK CONSTRAINT; Schema: salary; Owner: -
--

ALTER TABLE ONLY salary.games_payments
    ADD CONSTRAINT games_payments_ranks_id_fk FOREIGN KEY (rank) REFERENCES public.ranks(id);


--
-- Name: list salary_relation_2; Type: FK CONSTRAINT; Schema: salary; Owner: -
--

ALTER TABLE ONLY salary.list
    ADD CONSTRAINT salary_relation_2 FOREIGN KEY (location_id) REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


