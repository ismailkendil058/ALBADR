import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { email, password, fullName, role, store } = await req.json()

        // Use SERVICE_ROLE_KEY to bypass security
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Create the Auth User
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
        })

        if (authError) {
            console.error("Auth error:", authError);
            return new Response(JSON.stringify({ error: authError.message }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        const userId = authUser.user.id

        // 2. Assign the Role
        const { error: roleError } = await supabaseAdmin.from('user_roles').insert({ user_id: userId, role })
        if (roleError) {
            console.error("Role error:", roleError);
            // Clean up user if role fails
            await supabaseAdmin.auth.admin.deleteUser(userId);
            return new Response(JSON.stringify({ error: roleError.message }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // 3. Update the Profile (Profiles are created by a DB trigger, so we update)
        const { error: profileError } = await supabaseAdmin.from('profiles').update({
            full_name: fullName,
            assigned_store: store
        }).eq('id', userId)

        if (profileError) {
            console.error("Profile error:", profileError);
            return new Response(JSON.stringify({ error: profileError.message }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    } catch (err: any) {
        console.error("Unknown error:", err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
