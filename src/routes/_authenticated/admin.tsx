import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — SafePath" },
      { name: "description", content: "Manage verified support organisations and verification dates." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Service = {
  id: string;
  name: string;
  category_slug: string;
  description: string;
  location: string | null;
  phone: string | null;
  website: string | null;
  verification_status: string;
  last_verified_at: string | null;
  is_published: boolean;
};

const BLANK = {
  name: "",
  category_slug: "",
  description: "",
  location: "",
  phone: "",
  website: "",
};

function AdminPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState("");

  const isAdmin = useQuery({
    queryKey: ["is_admin"],
    queryFn: async () => {
      const { data, error: queryError } = await supabase.from("user_roles").select("role").eq("role", "admin");
      if (queryError) throw queryError;
      return (data ?? []).length > 0;
    },
  });

  const categories = useQuery({
    queryKey: ["service_categories"],
    queryFn: async () => {
      const { data, error: queryError } = await supabase
        .from("service_categories")
        .select("slug,name")
        .order("sort_order");
      if (queryError) throw queryError;
      return data ?? [];
    },
  });

  const services = useQuery({
    queryKey: ["admin_services"],
    queryFn: async (): Promise<Service[]> => {
      const { data, error: queryError } = await supabase
        .from("support_services")
        .select(
          "id,name,category_slug,description,location,phone,website,verification_status,last_verified_at,is_published",
        )
        .order("name");
      if (queryError) throw queryError;
      return (data ?? []) as Service[];
    },
    enabled: isAdmin.data === true,
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error: insertError } = await supabase.from("support_services").insert({
        name: form.name.trim(),
        category_slug: form.category_slug,
        description: form.description.trim(),
        location: form.location.trim() || null,
        phone: form.phone.trim() || null,
        website: form.website.trim() || null,
        verification_status: "verified",
        last_verified_at: new Date().toISOString().slice(0, 10),
        is_sample: false,
        is_published: true,
      });
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_services"] });
      queryClient.invalidateQueries({ queryKey: ["support_services"] });
      setForm(BLANK);
      toast.success("Organisation added.");
    },
    onError: () => setError("The organisation could not be saved."),
  });

  const reverify = useMutation({
    mutationFn: async (id: string) => {
      const { error: updateError } = await supabase
        .from("support_services")
        .update({
          verification_status: "verified",
          last_verified_at: new Date().toISOString().slice(0, 10),
        })
        .eq("id", id);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_services"] });
      queryClient.invalidateQueries({ queryKey: ["support_services"] });
      toast.success("Marked as verified today.");
    },
    onError: () => toast.error("That could not be updated."),
  });

  if (isAdmin.isLoading) {
    return (
      <AppShell>
        <div className="surface h-32 animate-pulse bg-muted" />
      </AppShell>
    );
  }

  if (!isAdmin.data) {
    return (
      <AppShell>
        <h1 className="font-display text-[28px] text-foreground">Admin</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          This area is for people who maintain the support directory. Your account does not have that role.
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <h1 className="font-display text-[28px] leading-tight text-foreground">Directory admin</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
        Add and re-verify support organisations. Journal entries and emergency plans are never visible here.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          if (form.name.trim().length < 2 || !form.category_slug || form.description.trim().length < 10) {
            setError("Name, category and a description of at least 10 characters are required.");
            return;
          }
          create.mutate();
        }}
        className="surface mt-5 space-y-3 px-4 py-4"
      >
        <div>
          <label htmlFor="name" className="eyebrow">
            Organisation name
          </label>
          <input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-4 text-[15px] text-foreground"
          />
        </div>
        <div>
          <label htmlFor="cat" className="eyebrow">
            Category
          </label>
          <select
            id="cat"
            value={form.category_slug}
            onChange={(e) => setForm({ ...form, category_slug: e.target.value })}
            className="mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-4 text-[15px] text-foreground"
          >
            <option value="">Choose…</option>
            {(categories.data ?? []).map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="desc" className="eyebrow">
            Description
          </label>
          <textarea
            id="desc"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-[15px] text-foreground"
          />
        </div>
        <div>
          <label htmlFor="loc" className="eyebrow">
            Location
          </label>
          <input
            id="loc"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-4 text-[15px] text-foreground"
          />
        </div>
        <div>
          <label htmlFor="phone" className="eyebrow">
            Phone
          </label>
          <input
            id="phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-4 text-[15px] text-foreground"
          />
        </div>
        <div>
          <label htmlFor="web" className="eyebrow">
            Website
          </label>
          <input
            id="web"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            className="mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-4 text-[15px] text-foreground"
          />
        </div>
        {error && (
          <p role="alert" className="text-[13px] text-destructive">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={create.isPending}
          className="min-h-12 w-full rounded-xl bg-primary text-[15px] font-medium text-primary-foreground disabled:opacity-50"
        >
          {create.isPending ? "Saving…" : "Add verified organisation"}
        </button>
      </form>

      <ul className="mt-5 space-y-2.5">
        {(services.data ?? []).map((service) => (
          <li key={service.id} className="surface px-4 py-4">
            <p className="eyebrow">{service.category_slug}</p>
            <h2 className="mt-1 font-display text-[17px] text-foreground">{service.name}</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {service.verification_status} · last verified {service.last_verified_at ?? "never"}
            </p>
            <button
              type="button"
              onClick={() => reverify.mutate(service.id)}
              className="mt-3 min-h-11 rounded-xl border border-border px-4 text-[14px] font-medium text-foreground"
            >
              Mark verified today
            </button>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
