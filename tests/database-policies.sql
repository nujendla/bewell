insert into auth.users values('11111111-1111-1111-1111-111111111111'),('22222222-2222-2222-2222-222222222222');
insert into public.tasks(user_id,day,title) values('11111111-1111-1111-1111-111111111111',current_date,'mine'),('22222222-2222-2222-2222-222222222222',current_date,'theirs');
insert into public.subscriptions(id,user_id,status,mode,current_end) values('sub_a','11111111-1111-1111-1111-111111111111','active','test',9999999999),('sub_b','22222222-2222-2222-2222-222222222222','active','test',9999999999);
insert into storage.objects(bucket_id,name) values('body-photos','11111111-1111-1111-1111-111111111111/a'),('body-photos','22222222-2222-2222-2222-222222222222/b');
set role authenticated;
set request.jwt.claim.sub='11111111-1111-1111-1111-111111111111';
do $$begin
 if (select count(*) from tasks)<>1 then raise exception 'task isolation failed';end if;
 if (select count(*) from subscriptions)<>1 then raise exception 'subscription isolation failed';end if;
 if (select count(*) from storage.objects)<>1 then raise exception 'photo isolation failed';end if;
 update tasks set title='modified' where user_id='22222222-2222-2222-2222-222222222222';
 if found then raise exception 'cross-user update allowed';end if;
 begin
 insert into tasks(user_id,day,title) values('22222222-2222-2222-2222-222222222222',current_date,'attack');
 raise exception 'cross-user insert allowed';exception when insufficient_privilege then null;end;
 begin
 update subscriptions set status='active';raise exception 'client subscription update allowed';exception when insufficient_privilege then null;end;
 begin
 insert into subscriptions(id,user_id,status) values('forged','11111111-1111-1111-1111-111111111111','active');raise exception 'client subscription insert allowed';exception when insufficient_privilege then null;end;
 if not take_rate_limit('ai',1) then raise exception 'first request denied';end if;
 if take_rate_limit('ai',1) then raise exception 'rate limit bypassed';end if;
 if (select count(*) from rate_limits)<>0 then raise exception 'rate table exposed';end if;
end $$;
reset role;
select 'RLS ownership, private photos, subscription write denial and rate limit checks passed' as result;
