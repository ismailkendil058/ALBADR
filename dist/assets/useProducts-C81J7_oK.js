import{u as a,a as d}from"./useMutation-CjuJ8xHN.js";import{n as f,s}from"./index-CzubCIAQ.js";function p({page:t=1,pageSize:r=12,searchQuery:e}={}){return a({queryKey:["products",{page:t,pageSize:r,searchQuery:e}],queryFn:async()=>{const u=(t-1)*r,n=u+r-1;let o=s.from("products").select(`
          *,
          category:categories(*),
          weights:product_weights(*)
        `,{count:"exact"});e&&(o=o.or(`name_fr.ilike.%${e}%,name_ar.ilike.%${e}%`));const{data:i,error:c,count:w}=await o.order("created_at",{ascending:!1}).range(u,n);if(c)throw c;return{data:i,count:w}}})}function h(t){return a({queryKey:["product",t],queryFn:async()=>{if(!t)return null;const{data:r,error:e}=await s.from("products").select(`
          name_ar,
          name_fr,
          *,
          category:categories(*),
          weights:product_weights(*)
        `).eq("id",t).maybeSingle();if(e)throw e;return r},enabled:!!t})}function l({categoryId:t,page:r,pageSize:e=12}){return a({queryKey:["products","category",t,{page:r,pageSize:e}],queryFn:async()=>{if(!t)return{data:[],count:0};const u=(r-1)*e,n=u+e-1,{data:o,error:i,count:c}=await s.from("products").select(`
          *,
          category:categories(*),
          weights:product_weights(*)
        `,{count:"exact"}).eq("category_id",t).order("created_at",{ascending:!1}).range(u,n);if(i)throw i;return{data:o,count:c}},enabled:!!t})}function m(){return a({queryKey:["products","featured"],queryFn:async()=>{const{data:t,error:r}=await s.from("products").select(`
          *,
          category:categories(*),
          weights:product_weights(*)
        `).eq("is_featured",!0).limit(8);if(r)throw r;return t}})}function q(){return a({queryKey:["products","bestseller"],queryFn:async()=>{const{data:t,error:r}=await s.from("products").select(`
          *,
          category:categories(*),
          weights:product_weights(*)
        `).eq("is_best_seller",!0).limit(8);if(r)throw r;return t}})}function _(){const t=f();return d({mutationFn:async r=>{const{data:e,error:u}=await s.from("products").insert(r.product).select().single();if(u)throw u;if(r.weights&&r.weights.length>0){const n=r.weights.map((i,c)=>({product_id:e.id,weight:i.weight,price:i.price,sort_order:i.sort_order??c})),{error:o}=await s.from("product_weights").insert(n);if(o)throw o}return e},onSuccess:()=>{t.invalidateQueries({queryKey:["products"]})}})}function F(){const t=f();return d({mutationFn:async r=>{const{error:e}=await s.from("products").update(r.product).eq("id",r.id);if(e)throw e;if(r.weights!==void 0&&(await s.from("product_weights").delete().eq("product_id",r.id),r.weights.length>0)){const u=r.weights.map((o,i)=>({product_id:r.id,weight:o.weight,price:o.price,sort_order:o.sort_order??i})),{error:n}=await s.from("product_weights").insert(u);if(n)throw n}return r.id},onSuccess:()=>{t.invalidateQueries({queryKey:["products"]})}})}function P(){const t=f();return d({mutationFn:async r=>{const{error:e}=await s.from("products").delete().eq("id",r);if(e)throw e;return r},onSuccess:()=>{t.invalidateQueries({queryKey:["products"]})}})}function K(){return a({queryKey:["products","promo"],queryFn:async()=>{const{data:t,error:r}=await s.from("products").select(`
          *,
          category:categories(*),
          weights:product_weights(*)
        `).eq("is_promo",!0).limit(8);if(r)throw r;return t}})}export{q as a,K as b,h as c,p as d,l as e,_ as f,F as g,P as h,m as u};
