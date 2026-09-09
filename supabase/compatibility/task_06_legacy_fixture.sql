insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,email_change,email_change_token_new,recovery_token)
values
('00000000-0000-0000-0000-000000000000','71000000-0000-0000-0000-000000000001','authenticated','authenticated','legacy-owner@test.local','',now(),'{}','{}',now(),now(),'','','',''),
('00000000-0000-0000-0000-000000000000','71000000-0000-0000-0000-000000000002','authenticated','authenticated','legacy-athlete@test.local','',now(),'{}','{}',now(),now(),'','','','');
insert into public.assessorias(id,nome,slug) values ('7a000000-0000-0000-0000-000000000001','Legacy Preserved','legacy-preserved');
insert into public.profiles(id,assessoria_id,nome,papel) values
('71000000-0000-0000-0000-000000000001','7a000000-0000-0000-0000-000000000001','Legacy Owner','treinador'),
('71000000-0000-0000-0000-000000000002','7a000000-0000-0000-0000-000000000001','Legacy Athlete','atleta');
insert into public.treinadores(id,assessoria_id) values ('71000000-0000-0000-0000-000000000001','7a000000-0000-0000-0000-000000000001');
insert into public.atletas(id,assessoria_id,treinador_id) values ('71000000-0000-0000-0000-000000000002','7a000000-0000-0000-0000-000000000001','71000000-0000-0000-0000-000000000001');
insert into public.assinaturas_atletas(id,assessoria_id,atleta_id,valor_centavos,periodicidade,dia_vencimento,status,inicio_em) values ('72000000-0000-0000-0000-000000000001','7a000000-0000-0000-0000-000000000001','71000000-0000-0000-0000-000000000002',12345,'mensal',10,'ativa',current_date);
insert into public.cobrancas(id,assessoria_id,assinatura_id,atleta_id,valor_centavos,vencimento_em,status) values ('73000000-0000-0000-0000-000000000001','7a000000-0000-0000-0000-000000000001','72000000-0000-0000-0000-000000000001','71000000-0000-0000-0000-000000000002',12345,current_date,'aberta');
insert into public.preferencias_comunicacao(assessoria_id,atleta_id,whatsapp_opt_in,cobranca_whatsapp) values ('7a000000-0000-0000-0000-000000000001','71000000-0000-0000-0000-000000000002',false,false);
