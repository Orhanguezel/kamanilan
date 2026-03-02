// =============================================================
// FILE: src/components/admin/subcategories/SubCategoriesList.tsx
// Ensotek – SubCategory Listesi
//
// Responsive Strategy (Bootstrap 5):
// - < xxl: CARDS (tablet + mobile) ✅
// - xxl+: TABLE (DnD enabled here only) ✅
//
// Notes:
// - Client-side pagination
// - DnD reorders full dataset (items) based on drag/drop
// =============================================================

import React, { useEffect, useMemo, useState } from 'react';
import type {
  SubCategoryDto,
  CategoryDto
 } from '@/integrations/shared';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';

/* ---------------- Helpers ---------------- */

const safeText = (v: unknown) => (v === null || v === undefined ? '' : String(v));

const normLocale = (v: unknown) =>
  String(v ?? '')
    .trim()
    .toLowerCase()
    .replace('_', '-')
    .split('-')[0]
    .trim();

const formatText = (v: unknown, max = 90): string => {
  const s = safeText(v);
  if (!s) return '';
  if (s.length <= max) return s;
  return s.slice(0, max - 3) + '...';
};

export type SubCategoriesListProps = {
  items: SubCategoryDto[];
  loading: boolean;

  categoriesMap: Record<string, CategoryDto | undefined>;

  onEdit: (item: SubCategoryDto) => void;
  onDelete: (item: SubCategoryDto) => void;
  onToggleActive: (item: SubCategoryDto, value: boolean) => void;
  onToggleFeatured: (item: SubCategoryDto, value: boolean) => void;

  onReorder: (next: SubCategoryDto[]) => void;
  onSaveOrder: () => void;
  savingOrder: boolean;
};

const PAGE_SIZE = 20;

export const SubCategoriesList: React.FC<SubCategoriesListProps> = ({
  items,
  loading,
  categoriesMap,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
  onReorder,
  onSaveOrder,
  savingOrder,
}) => {
  const rows = items ?? [];
  const totalItems = rows.length;
  const hasData = totalItems > 0;

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const busy = loading || !!savingOrder;

  const pageCount = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  useEffect(() => {
    setPage((prev) => {
      const maxPage = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
      return Math.min(prev, maxPage);
    });
  }, [totalItems]);

  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const pageRows = rows.slice(startIndex, endIndex);

  // DnD sadece xxl+ tabloda (UI temizliği)
  const canReorderXxl = !busy;

  /* ---------------- DnD (full dataset order) ---------------- */

  const handleDragStart = (id: string) => {
    if (!canReorderXxl) return;
    setDraggingId(id);
  };

  const handleDragEnd = () => setDraggingId(null);

  const handleDropOn = (targetId: string) => {
    if (!canReorderXxl) return;
    if (!draggingId || draggingId === targetId) return;

    const currentIndex = rows.findIndex((r) => r.id === draggingId);
    const targetIndex = rows.findIndex((r) => r.id === targetId);
    if (currentIndex === -1 || targetIndex === -1) return;

    const next = [...rows];
    const [moved] = next.splice(currentIndex, 1);
    next.splice(targetIndex, 0, moved);

    onReorder(next);
  };

  /* ---------------- Pagination ---------------- */

  const pages = useMemo(() => {
    const out: Array<number | 'ellipsis-left' | 'ellipsis-right'> = [];
    if (pageCount <= 7) {
      for (let i = 1; i <= pageCount; i += 1) out.push(i);
      return out;
    }

    out.push(1);

    const siblings = 1;
    let left = Math.max(2, currentPage - siblings);
    let right = Math.min(pageCount - 1, currentPage + siblings);

    if (left > 2) out.push('ellipsis-left');
    else left = 2;

    for (let i = left; i <= right; i += 1) out.push(i);

    if (right < pageCount - 1) out.push('ellipsis-right');
    else right = pageCount - 1;

    out.push(pageCount);
    return out;
  }, [pageCount, currentPage]);

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > pageCount) return;
    setPage(nextPage);
  };

  /* ---------------- Render helpers ---------------- */

  const getCategoryLabel = (item: SubCategoryDto) => {
    const c = categoriesMap[item.category_id];
    if (!c) return item.category_id;

    const name =
      safeText((c as any).name) || safeText((c as any).title) || safeText((c as any).slug) || c.id;
    const loc = safeText((c as any).locale) || '-';
    return `${name} (${loc})`;
  };

  const renderBadges = (item: SubCategoryDto) => {
    const loc = normLocale((item as any).locale) || '-';
    return (
      <div className="d-flex flex-wrap gap-2">
        <span className="badge bg-light text-dark border small">
          Dil: <code>{loc}</code>
        </span>
        <span className="badge bg-light text-dark border small">
          Sıra: <strong>{(item as any).display_order ?? 0}</strong>
        </span>
        {(item as any).is_featured ? (
          <span className="badge bg-warning-subtle text-warning border border-warning-subtle small">
            Öne çıkan
          </span>
        ) : null}
        {(item as any).is_active ? (
          <span className="badge bg-success-subtle text-success border border-success-subtle small">
            Aktif
          </span>
        ) : (
          <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle small">
            Pasif
          </span>
        )}
      </div>
    );
  };

  const captionText = (
    <span className="text-muted small">
      Sıralama değişikliği (DnD) sadece çok büyük ekranlarda (xxl+) tabloda aktiftir. Kalıcı yapmak
      için <strong>&quot;Sıralamayı Kaydet&quot;</strong> butonunu kullan.
    </span>
  );

  return (
    <div className="card">
      <div className="card-header py-2">
        <div className="d-flex align-items-start align-items-md-center justify-content-between gap-2 flex-wrap">
          <div className="small fw-semibold">Alt Kategori Listesi</div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            {busy && <span className="badge bg-secondary small">İşlem yapılıyor...</span>}

            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={onSaveOrder}
              disabled={!hasData || savingOrder || loading}
            >
              {savingOrder ? 'Sıralama kaydediliyor...' : 'Sıralamayı Kaydet'}
            </button>

            <span className="text-muted small">
              Toplam: <strong>{totalItems}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="card-body p-0">
        {/* ===================== XXL+ TABLE (DnD only) ===================== */}
        <div className="d-none d-xxl-block">
          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 56 }} />
                  <th style={{ width: '34%' }}>Alt Kategori</th>
                  <th style={{ width: '26%' }}>Kategori</th>
                  <th style={{ width: 120 }}>Dil</th>
                  <th className="text-center" style={{ width: 90 }}>
                    Aktif
                  </th>
                  <th className="text-center" style={{ width: 110 }}>
                    Öne Çıkan
                  </th>
                  <th className="text-center" style={{ width: 90 }}>
                    Sıra
                  </th>
                  <th style={{ width: 170 }} className="text-end text-nowrap">
                    İşlemler
                  </th>
                </tr>
              </thead>

              <tbody>
                {!hasData ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 small text-muted">
                      {loading ? 'Alt kategoriler yükleniyor...' : 'Henüz alt kategori bulunmuyor.'}
                    </td>
                  </tr>
                ) : (
                  pageRows.map((item, index) => {
                    const globalIndex = startIndex + index;

                    const name = safeText((item as any).name) || '(Ad yok)';
                    const slug = safeText((item as any).slug) || '-';
                    const locale = safeText((item as any).locale) || '-';

                    return (
                      <tr
                        key={item.id}
                        draggable={canReorderXxl}
                        onDragStart={() => handleDragStart(item.id)}
                        onDragEnd={canReorderXxl ? handleDragEnd : undefined}
                        onDragOver={canReorderXxl ? (e) => e.preventDefault() : undefined}
                        onDrop={canReorderXxl ? () => handleDropOn(item.id) : undefined}
                        className={draggingId === item.id ? 'table-active' : undefined}
                        style={canReorderXxl ? { cursor: 'move' } : { cursor: 'default' }}
                      >
                        <td className="text-muted small text-nowrap">
                          {canReorderXxl && <span className="me-1">≡</span>}
                          {globalIndex + 1}
                        </td>

                        <td className="align-middle">
                          <div className="d-flex align-items-center gap-2">
                            {(item as any).image_url ? (
                              <div
                                className="border rounded bg-light"
                                style={{
                                  width: 64,
                                  height: 40,
                                  overflow: 'hidden',
                                  flex: '0 0 auto',
                                }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={(item as any).image_url}
                                  alt={safeText((item as any).alt) || name}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            ) : null}

                            <div style={{ minWidth: 0 }}>
                              <div className="fw-semibold small text-truncate" title={name}>
                                {name}
                              </div>
                              <div className="text-muted small text-truncate" title={slug}>
                                <code>{slug}</code>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="align-middle small">
                          <div className="text-truncate" title={getCategoryLabel(item)}>
                            {getCategoryLabel(item)}
                          </div>
                        </td>

                        <td className="align-middle small text-nowrap">
                          <code>{locale}</code>
                        </td>

                        <td className="align-middle text-center">
                          <div className="form-check form-switch d-inline-flex m-0">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={!!(item as any).is_active}
                              disabled={busy}
                              onChange={(e) => onToggleActive(item, e.target.checked)}
                            />
                          </div>
                        </td>

                        <td className="align-middle text-center">
                          <div className="form-check form-switch d-inline-flex m-0">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={!!(item as any).is_featured}
                              disabled={busy}
                              onChange={(e) => onToggleFeatured(item, e.target.checked)}
                            />
                          </div>
                        </td>

                        <td className="align-middle text-center small">
                          {(item as any).display_order ?? 0}
                        </td>

                        <td className="align-middle text-end text-nowrap">
                          <div className="btn-group btn-group-sm">
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => onEdit(item)}
                              disabled={busy}
                            >
                              Düzenle
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => onDelete(item)}
                              disabled={busy}
                            >
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              <caption className="px-3 py-2 text-start">{captionText}</caption>
            </table>
          </div>
        </div>

        {/* ===================== < XXL : CARDS (tablet + mobile) ===================== */}
        <div className="d-block d-xxl-none">
          {loading ? (
            <div className="px-3 py-3 text-center text-muted small">
              Alt kategoriler yükleniyor...
            </div>
          ) : hasData ? (
            <div className="p-3">
              <div className="row g-3">
                {pageRows.map((item, index) => {
                  const globalIndex = startIndex + index;

                  const name = safeText((item as any).name) || '(Ad yok)';
                  const slug = safeText((item as any).slug) || '-';
                  const desc = safeText((item as any).description);
                  const img = safeText((item as any).image_url);

                  return (
                    <div key={item.id} className="col-12 col-lg-6">
                      <div className="border rounded-3 p-3 bg-white h-100">
                        <div className="d-flex justify-content-between align-items-start gap-2">
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <span className="badge bg-light text-dark border">
                              #{globalIndex + 1}
                            </span>
                            <span className="badge bg-light text-dark border small">
                              Kategori: {formatText(getCategoryLabel(item), 40)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 d-flex gap-2">
                          {img ? (
                            <div
                              className="border rounded bg-light"
                              style={{
                                width: 88,
                                height: 56,
                                overflow: 'hidden',
                                flex: '0 0 auto',
                              }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img}
                                alt={safeText((item as any).alt) || name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          ) : null}

                          <div style={{ minWidth: 0 }}>
                            <div
                              className="fw-semibold"
                              style={{ wordBreak: 'break-word' }}
                              title={name}
                            >
                              {name}
                            </div>
                            <div className="text-muted small" style={{ wordBreak: 'break-word' }}>
                              Slug: <code>{slug}</code>
                            </div>
                            {desc ? (
                              <div
                                className="text-muted small mt-1"
                                style={{ wordBreak: 'break-word' }}
                              >
                                {formatText(desc, 120)}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="mt-3">{renderBadges(item)}</div>

                        <div className="mt-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
                          <div className="d-flex flex-wrap gap-3">
                            <div className="form-check form-switch m-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={!!(item as any).is_active}
                                disabled={busy}
                                onChange={(e) => onToggleActive(item, e.target.checked)}
                              />
                              <label className="form-check-label small">Aktif</label>
                            </div>

                            <div className="form-check form-switch m-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={!!(item as any).is_featured}
                                disabled={busy}
                                onChange={(e) => onToggleFeatured(item, e.target.checked)}
                              />
                              <label className="form-check-label small">Öne çıkan</label>
                            </div>
                          </div>

                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => onEdit(item)}
                              disabled={busy}
                            >
                              Düzenle
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => onDelete(item)}
                              disabled={busy}
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3">{captionText}</div>
            </div>
          ) : (
            <div className="px-3 py-3 text-center text-muted small">
              Henüz alt kategori bulunmuyor.
            </div>
          )}
        </div>

        {/* ===================== Pagination (common) ===================== */}
        {pageCount > 1 && (
          <div className="py-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
                    }}
                  />
                </PaginationItem>

                {pages.map((p, idx) =>
                  typeof p === 'number' ? (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={p === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(p);
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={`${p}-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};
