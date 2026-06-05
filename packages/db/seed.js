const {Client}=require('pg');
const c=new Client({host:'localhost',port:5432,user:'fap_user',password:'fap_password',database:'fap_dev'});
c.connect().then(async()=>{
  const d=await c.query("INSERT INTO designs (user_id,generation_mode,prompt_json,generated_images,ai_model_version,expires_at,is_saved) VALUES ('96391d52-6e67-4b1d-b2d0-2cc30b9fb994','guided','{}','{}','test',NOW()+'30 days'::interval,true) RETURNING id");
  const o=await c.query("INSERT INTO orders (design_id,client_id,couturiere_id,status) VALUES ('"+d.rows[0].id+"','96391d52-6e67-4b1d-b2d0-2cc30b9fb994','c42b1af9-8541-4e55-b963-964c6f021990','completed') RETURNING id");
  console.log('Commande cree:',o.rows[0].id);
  c.end();
});
