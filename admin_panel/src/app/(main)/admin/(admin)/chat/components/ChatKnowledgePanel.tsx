// =============================================================
// FILE: src/app/(main)/admin/(admin)/chat/components/ChatKnowledgePanel.tsx
// AI Knowledge Base CRUD panel
// Ensotek
// =============================================================

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

import { useAdminT } from '@/app/(main)/admin/_components/common/useAdminT';
import {
  useListChatKnowledgeAdminQuery,
  useCreateChatKnowledgeAdminMutation,
  useUpdateChatKnowledgeAdminMutation,
  useDeleteChatKnowledgeAdminMutation,
} from '@/integrations/hooks';
import type {
  ChatAiKnowledgeItem,
  ChatAiKnowledgeCreateBody,
  ChatAiKnowledgeUpdateBody,
  ChatAiKnowledgeListParams,
} from '@/integrations/shared';
import { AVAILABLE_LOCALE_CODES, getDefaultLocaleCode, getLocaleLabel } from '@/i18n/localeCatalog';

// ─── Form dialog ────────────────────────────────────────────

type FormState = {
  locale: string;
  title: string;
  content: string;
  tags: string;
  priority: number;
  is_active: boolean;
};

const EMPTY_FORM: FormState = {
  locale: getDefaultLocaleCode(),
  title: '',
  content: '',
  tags: '',
  priority: 100,
  is_active: true,
};

function KnowledgeFormDialog({
  open,
  onClose,
  editItem,
}: {
  open: boolean;
  onClose: () => void;
  editItem: ChatAiKnowledgeItem | null;
}) {
  const t = useAdminT('admin.chat');
  const [create, { isLoading: creating }] = useCreateChatKnowledgeAdminMutation();
  const [update, { isLoading: updating }] = useUpdateChatKnowledgeAdminMutation();

  const [form, setForm] = React.useState<FormState>(EMPTY_FORM);

  React.useEffect(() => {
    if (editItem) {
      setForm({
        locale: editItem.locale,
        title: editItem.title,
        content: editItem.content,
        tags: editItem.tags ?? '',
        priority: editItem.priority,
        is_active: editItem.is_active === 1,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editItem, open]);

  const saving = creating || updating;

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error(t('knowledge.requiredFields'));
      return;
    }

    try {
      if (editItem) {
        const body: ChatAiKnowledgeUpdateBody = {
          locale: form.locale,
          title: form.title.trim(),
          content: form.content.trim(),
          tags: form.tags.trim() || null,
          priority: form.priority,
          is_active: form.is_active ? 1 : 0,
        };
        await update({ id: editItem.id, body }).unwrap();
        toast.success(t('knowledge.updated'));
      } else {
        const body: ChatAiKnowledgeCreateBody = {
          locale: form.locale,
          title: form.title.trim(),
          content: form.content.trim(),
          tags: form.tags.trim() || undefined,
          priority: form.priority,
          is_active: form.is_active ? 1 : 0,
        };
        await create(body).unwrap();
        toast.success(t('knowledge.created'));
      }
      onClose();
    } catch {
      toast.error(t('knowledge.saveError'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editItem ? t('knowledge.editTitle') : t('knowledge.addTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>{t('knowledge.locale')}</Label>
              <Select value={form.locale} onValueChange={(v) => setForm((p) => ({ ...p, locale: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_LOCALE_CODES.map((code) => (
                    <SelectItem key={code} value={code}>
                      {getLocaleLabel(code)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>{t('knowledge.priority')}</Label>
              <Input
                type="number"
                min={0}
                max={1000}
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: Number(e.target.value) || 100 }))}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>{t('knowledge.titleLabel')}</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder={t('knowledge.titlePlaceholder')}
            />
          </div>

          <div className="space-y-1">
            <Label>{t('knowledge.contentLabel')}</Label>
            <Textarea
              rows={5}
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              placeholder={t('knowledge.contentPlaceholder')}
            />
          </div>

          <div className="space-y-1">
            <Label>{t('knowledge.tags')}</Label>
            <Input
              value={form.tags}
              onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
              placeholder={t('knowledge.tagsPlaceholder')}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label>{t('knowledge.active')}</Label>
            <Switch
              checked={form.is_active}
              onCheckedChange={(v: boolean) => setForm((p) => ({ ...p, is_active: v }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t('knowledge.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? t('knowledge.saving') : t('knowledge.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main panel ─────────────────────────────────────────────

export default function ChatKnowledgePanel() {
  const t = useAdminT('admin.chat');
  const [remove] = useDeleteChatKnowledgeAdminMutation();

  const [localeFilter, setLocaleFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<ChatAiKnowledgeItem | null>(null);

  const params: ChatAiKnowledgeListParams = React.useMemo(() => {
    const p: ChatAiKnowledgeListParams = { limit: 100 };
    if (localeFilter !== 'all') p.locale = localeFilter;
    const q = search.trim();
    if (q) p.q = q;
    return p;
  }, [localeFilter, search]);

  const { data, isFetching } = useListChatKnowledgeAdminQuery(params);
  const items = data?.items ?? [];

  const handleEdit = (item: ChatAiKnowledgeItem) => {
    setEditItem(item);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditItem(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id).unwrap();
      toast.success(t('knowledge.deleted'));
    } catch {
      toast.error(t('knowledge.deleteError'));
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">{t('knowledge.title')}</CardTitle>
            <Button size="sm" onClick={handleAdd} className="gap-1">
              <Plus className="h-4 w-4" />
              {t('knowledge.addNew')}
            </Button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('knowledge.searchPlaceholder')}
              className="sm:max-w-[260px]"
            />
            <Select value={localeFilter} onValueChange={setLocaleFilter}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('knowledge.allLocales')}</SelectItem>
                {AVAILABLE_LOCALE_CODES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {getLocaleLabel(code)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] min-w-[50px]">{t('knowledge.locale')}</TableHead>
                  <TableHead className="w-[70px] min-w-[70px] hidden sm:table-cell">{t('knowledge.priority')}</TableHead>
                  <TableHead className="min-w-[200px] max-w-[400px]">{t('knowledge.titleLabel')}</TableHead>
                  <TableHead className="hidden lg:table-cell min-w-[150px] max-w-[200px]">{t('knowledge.tags')}</TableHead>
                  <TableHead className="w-[70px] min-w-[70px] hidden sm:table-cell">{t('knowledge.active')}</TableHead>
                  <TableHead className="w-[100px] min-w-[100px]" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-sm text-muted-foreground text-center">
                      {isFetching ? t('knowledge.loading') : t('knowledge.noItems')}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] whitespace-nowrap">
                          {item.locale.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs hidden sm:table-cell">{item.priority}</TableCell>
                      <TableCell className="max-w-[400px]">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 break-words">
                          {item.content}
                        </p>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-[200px] truncate">
                        {item.tags || '-'}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={item.is_active ? 'default' : 'secondary'} className="text-[10px] whitespace-nowrap">
                          {item.is_active ? t('knowledge.yes') : t('knowledge.no')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 shrink-0"
                            onClick={() => handleEdit(item)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <KnowledgeFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editItem={editItem}
      />
    </>
  );
}
