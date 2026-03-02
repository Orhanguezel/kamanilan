"use client";

import { useState, useMemo } from "react";
import {
  useAddressListQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} from "@/modules/address/address.service";
import type { UserAddress, AddressInput } from "@/modules/address/address.type";
import { TURKEY_CITIES } from "@/data/turkey-cities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Plus, Pencil, Trash2, Loader2, Star } from "lucide-react";

interface Props {
  translations: Record<string, string>;
}

const EMPTY_FORM: AddressInput = {
  title: "",
  full_name: "",
  phone: "",
  email: "",
  address_line: "",
  city: "",
  district: "",
  postal_code: "",
  is_default: false,
};

export function AdreslerClient({ translations: tr }: Props) {
  const { data: addresses = [], isLoading } = useAddressListQuery();
  const createMutation = useCreateAddressMutation();
  const updateMutation = useUpdateAddressMutation();
  const deleteMutation = useDeleteAddressMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressInput>(EMPTY_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const selectedCityData = useMemo(
    () => TURKEY_CITIES.find((c) => c.value === form.city) ?? null,
    [form.city]
  );

  const districts = selectedCityData?.districts ?? [];

  function setField<K extends keyof AddressInput>(key: K, value: AddressInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const handleCityChange = (value: string) => {
    setForm((f) => ({ ...f, city: value, district: "" }));
  };

  const handleEdit = (addr: UserAddress) => {
    setEditingId(addr.id);
    setForm({
      title: addr.title,
      full_name: addr.full_name,
      phone: addr.phone,
      email: addr.email || "",
      address_line: addr.address_line,
      city: addr.city,
      district: addr.district,
      postal_code: addr.postal_code || "",
      is_default: addr.is_default === 1,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: form },
        { onSuccess: handleCancelForm }
      );
    } else {
      createMutation.mutate(form, { onSuccess: handleCancelForm });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{tr.addresses}</h2>
          {!showForm && (
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              {tr.add_address}
            </Button>
          )}
        </div>

        {/* Address form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 rounded-lg border p-4 space-y-4">
            <h3 className="font-medium text-sm">
              {editingId ? tr.edit : tr.add_address}
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{tr.address_title}</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  placeholder="Ev, İş..."
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>{tr.address_phone}</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  type="tel"
                  placeholder="05XX XXX XX XX"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Ad Soyad</Label>
              <Input
                value={form.full_name}
                onChange={(e) => setField("full_name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>{tr.address_email}</Label>
              <Input
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                type="email"
                placeholder="ornek@mail.com"
              />
            </div>

            <div className="space-y-1.5">
              <Label>{tr.address_field}</Label>
              <Input
                value={form.address_line}
                onChange={(e) => setField("address_line", e.target.value)}
                placeholder="Mahalle, sokak, kapı no..."
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Şehir</Label>
                <Select value={form.city} onValueChange={handleCityChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Şehir seçin" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {TURKEY_CITIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>İlçe</Label>
                <Select
                  value={form.district}
                  onValueChange={(v) => setField("district", v)}
                  disabled={!form.city}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={form.city ? "İlçe seçin" : "Önce şehir seçin"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {districts.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{tr.address_postal}</Label>
              <Input
                value={form.postal_code}
                onChange={(e) => setField("postal_code", e.target.value)}
                placeholder="34000"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_default"
                checked={!!form.is_default}
                onChange={(e) => setField("is_default", e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="is_default">{tr.set_default}</Label>
            </div>

            {(createMutation.isError || updateMutation.isError) && (
              <p className="text-sm text-destructive">{tr.error}</p>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {tr.save}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancelForm}>
                {tr.cancel}
              </Button>
            </div>
          </form>
        )}

        {/* Address list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <MapPin className="mb-3 h-10 w-10 opacity-30" />
            <p className="text-sm">{tr.no_addresses}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="rounded-lg border p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{addr.title}</span>
                    {addr.is_default === 1 && (
                      <span className="flex items-center gap-1 text-xs text-primary">
                        <Star className="h-3 w-3 fill-primary" />
                        Varsayılan
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {addr.full_name} · {addr.phone}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {addr.address_line}, {addr.district}, {addr.city}
                    {addr.postal_code ? ` ${addr.postal_code}` : ""}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(addr)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteConfirmId(addr.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-card p-6 shadow-xl">
            <h3 className="mb-3 font-semibold">Adresi sil</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Bu adresi silmek istediğinize emin misiniz?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                {tr.cancel}
              </Button>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  deleteMutation.mutate(deleteConfirmId, {
                    onSuccess: () => setDeleteConfirmId(null),
                  });
                }}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {tr.delete}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
