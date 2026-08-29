'use client';

import * as React from 'react';
import { Check, Gauge, Lightbulb, X } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  ARTICLE_SEO_CHECK_META,
  scoreArticleSeoQuality,
  type ArticleSeoQualityInput,
  type ArticleSeoQualityScore,
} from '@/integrations/shared/article-seo-quality';

const LEVEL_META: Record<
  ArticleSeoQualityScore['level'],
  { label: string; text: string; ring: string; bar: string; badge: string }
> = {
  ready: {
    label: 'Yayına hazır',
    text: 'text-emerald-600 dark:text-emerald-400',
    ring: 'border-emerald-500/40',
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  publishable: {
    label: 'Geliştirilmeli',
    text: 'text-amber-600 dark:text-amber-400',
    ring: 'border-amber-500/40',
    bar: 'bg-amber-500',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  fail: {
    label: 'Yayınlanamaz',
    text: 'text-red-600 dark:text-red-400',
    ring: 'border-red-500/40',
    bar: 'bg-red-500',
    badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
  },
};

// Haber formundaki canlı SEO/GEO kalite paneli. Girdi form değerlerinden gelir,
// puan istemcide anlık hesaplanır (backend'le aynı saf fonksiyon).
export default function ArticleSeoPanel({ input }: { input: ArticleSeoQualityInput }) {
  const score = React.useMemo(() => scoreArticleSeoQuality(input), [input]);
  const level = LEVEL_META[score.level];

  const groups = React.useMemo(() => {
    const acc: Record<string, { code: string; ok: boolean; label: string; points: number }[]> = {};
    for (const [code, ok] of Object.entries(score.checks)) {
      const meta = ARTICLE_SEO_CHECK_META[code];
      if (!meta) continue;
      (acc[meta.group] ||= []).push({ code, ok, label: meta.label, points: meta.points });
    }
    return Object.entries(acc);
  }, [score.checks]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Gauge className="h-4 w-4 text-primary" />
          İçerik SEO / GEO Kalitesi
        </CardTitle>
        <CardDescription className="text-xs">Yazarken canlı puanlanır · hedef 80+</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Skor */}
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'flex size-16 shrink-0 flex-col items-center justify-center rounded-full border-4 bg-muted/30',
              level.ring,
            )}
          >
            <span className={cn('text-xl font-black leading-none', level.text)}>{score.score}</span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">/ 100</span>
          </div>
          <div className="space-y-1.5">
            <div className={cn('text-sm font-bold', level.text)}>{level.label}</div>
            <span
              className={cn(
                'inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                score.gate_passed ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400',
              )}
            >
              {score.gate_passed ? 'Sert kapı geçti' : 'Sert kapı kaldı'}
            </span>
            <div className="h-1.5 w-40 max-w-full overflow-hidden rounded-full bg-muted">
              <div className={cn('h-full rounded-full transition-all', level.bar)} style={{ width: `${score.score}%` }} />
            </div>
          </div>
        </div>

        {/* İstatistik */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Kelime', value: String(score.word_count) },
            { label: 'Yoğunluk', value: `%${score.keyword_density}` },
            { label: 'Geçiş', value: String(score.keyword_occurrences) },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border bg-muted/20 p-2 text-center">
              <div className="text-sm font-bold">{stat.value}</div>
              <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
        {score.target_keyword ? (
          <div className="rounded-lg border bg-muted/20 px-3 py-2 text-xs">
            <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Odak kelime</span>{' '}
            <span className="font-medium">{score.target_keyword}</span>
          </div>
        ) : null}

        {/* Kontroller */}
        <div className="space-y-3">
          {groups.map(([group, items]) => (
            <div key={group} className="space-y-1">
              <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{group}</div>
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.code} className="flex items-center gap-2 text-xs">
                    <span
                      className={cn(
                        'flex size-4 shrink-0 items-center justify-center rounded-full',
                        item.ok
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-red-500/15 text-red-600 dark:text-red-400',
                      )}
                    >
                      {item.ok ? <Check className="size-3" /> : <X className="size-3" />}
                    </span>
                    <span className={item.ok ? '' : 'text-muted-foreground'}>{item.label}</span>
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground/70">
                      {item.ok ? `+${item.points}` : '0'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Öneriler */}
        {score.recommendations.length > 0 ? (
          <div className="space-y-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              <Lightbulb className="size-3.5" />
              Öneriler
            </div>
            <ul className="space-y-1.5">
              {score.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                  <span className="text-amber-500">→</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
