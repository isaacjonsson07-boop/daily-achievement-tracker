import React from 'react';
import { LessonData, LessonSection, LessonContentBlock } from '../data/lessonContent';

// ============================================
// STRUCTURED ACHIEVEMENT — Lesson Renderer
// Renders lesson content inside the Installation tab
// ============================================

interface LessonRendererProps {
  lesson: LessonData;
}

function PhaseAccentColor(phase: 1 | 2 | 3): string {
  if (phase === 2) return 'var(--blue, #6DB5F5)';
  if (phase === 3) return 'var(--green, #6ECB8B)';
  return 'var(--gold, #C5A55A)';
}

function phaseBorderClass(phase: 1 | 2 | 3): string {
  if (phase === 2) return 'border-sa-blue-border';
  if (phase === 3) return 'border-sa-green-border';
  return 'border-sa-gold-border';
}

function phaseTextClass(phase: 1 | 2 | 3): string {
  if (phase === 2) return 'text-sa-blue';
  if (phase === 3) return 'text-sa-green';
  return 'text-sa-gold';
}

function phaseBgClass(phase: 1 | 2 | 3): string {
  if (phase === 2) return 'bg-sa-blue-soft';
  if (phase === 3) return 'bg-sa-green-soft';
  return 'bg-sa-gold-soft';
}

// Render HTML strings safely (content is our own, not user-generated)
function HtmlContent({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// === Content Block Renderers ===

function ProseBlock({ html }: { html: string }) {
  return (
    <HtmlContent
      html={html}
      className="text-sa-cream-soft text-sm leading-relaxed mb-4 [&>strong]:text-sa-cream [&>strong]:font-medium [&>em]:italic [&>em]:text-sa-cream-muted"
    />
  );
}

function CalloutBlock({ html, phase }: { html: string; phase: 1 | 2 | 3 }) {
  return (
    <div
      className={`my-6 p-5 rounded-sa border ${phaseBorderClass(phase)} ${phaseBgClass(phase)}`}
    >
      <HtmlContent
        html={html}
        className="text-sm text-sa-cream-soft leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0 [&>strong]:text-sa-cream [&>strong]:font-medium [&>p>strong]:text-sa-cream [&>p>strong]:font-medium"
      />
    </div>
  );
}

function ExampleBlock({ block }: { block: LessonContentBlock }) {
  const isStrong = block.variant === 'strong';
  return (
    <div
      className={`my-4 p-5 rounded-sa border ${
        isStrong
          ? 'border-sa-green-border bg-sa-green-soft'
          : 'border-sa-rose-border bg-sa-rose-soft'
      }`}
    >
      <div
        className={`text-xs font-medium uppercase tracking-widest mb-2 ${
          isStrong ? 'text-sa-green' : 'text-sa-rose'
        }`}
      >
        {block.tag}
      </div>
      {block.quote && (
        <blockquote className="text-sa-cream text-sm italic mb-2 pl-3 border-l-2 border-sa-border-light">
          {block.quote}
        </blockquote>
      )}
      {block.note && (
        <p className="text-xs text-sa-cream-muted leading-relaxed">{block.note}</p>
      )}
    </div>
  );
}

function AppCardBlock({ block }: { block: LessonContentBlock }) {
  return (
    <div className="my-6 p-4 rounded-sa border border-sa-gold-border bg-sa-gold-soft flex items-center gap-4">
      <span className="text-sa-gold text-lg flex-shrink-0">◆</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-sa-gold">{block.label}</div>
        <HtmlContent
          html={block.description || ''}
          className="text-xs text-sa-cream-muted [&>strong]:text-sa-cream-soft [&>strong]:font-medium"
        />
      </div>
      <span className="text-sa-gold text-lg flex-shrink-0">→</span>
    </div>
  );
}

// === Section Renderer ===

function SectionRenderer({ section, phase }: { section: LessonSection; phase: 1 | 2 | 3 }) {
  return (
    <div className="mb-8">
      {section.title && (
        <h3 className="font-serif text-lg text-sa-cream mb-4">{section.title}</h3>
      )}
      {section.content.map((block, i) => {
        switch (block.type) {
          case 'prose':
            return <ProseBlock key={i} html={block.html || ''} />;
          case 'callout':
            return <CalloutBlock key={i} html={block.html || ''} phase={phase} />;
          case 'example':
            return <ExampleBlock key={i} block={block} />;
          case 'appCard':
            return <AppCardBlock key={i} block={block} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

// === Main Lesson Renderer ===

export function LessonRenderer({ lesson }: LessonRendererProps) {
  const accentColor = PhaseAccentColor(lesson.phase);

  return (
    <div className="lesson-content overflow-x-hidden">
      {/* Phase label */}
      <div
        className={`text-xs font-medium uppercase tracking-widest mb-3 ${phaseTextClass(lesson.phase)}`}
      >
        {lesson.phaseLabel}
      </div>

      {/* Title */}
      <h2 className="font-serif text-2xl sm:text-3xl text-sa-cream mb-4 leading-tight">
        {lesson.heroTitle.split('\n').map((line, i) => (
          <React.Fragment key={i}>
            {i > 0 && <br />}
            {line}
          </React.Fragment>
        ))}
      </h2>

      {/* Intro */}
      <p className="text-sm text-sa-cream-muted leading-relaxed mb-8">
        {lesson.heroIntro}
      </p>

      {/* Principle card */}
      <div
        className={`p-5 rounded-sa border mb-10 ${phaseBorderClass(lesson.phase)} ${phaseBgClass(lesson.phase)}`}
      >
        <div
          className={`text-xs font-medium uppercase tracking-widest mb-3 ${phaseTextClass(lesson.phase)}`}
        >
          {lesson.principleLabel}
        </div>
        {lesson.principleParagraphs.map((p, i) => (
          <HtmlContent
            key={i}
            html={p}
            className="text-sm text-sa-cream-soft leading-relaxed mb-3 last:mb-0 [&>strong]:text-sa-cream [&>strong]:font-medium"
          />
        ))}
      </div>

      {/* App card (if present, shown before sections) */}
      {lesson.appCard && (
        <div className="my-6 p-4 rounded-sa border border-sa-gold-border bg-sa-gold-soft flex items-center gap-4">
          <span className="text-sa-gold text-lg flex-shrink-0">◆</span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-sa-gold">{lesson.appCard.label}</div>
            <HtmlContent
              html={lesson.appCard.description}
              className="text-xs text-sa-cream-muted [&>strong]:text-sa-cream-soft [&>strong]:font-medium"
            />
          </div>
        </div>
      )}

      {/* Content sections */}
      {lesson.sections.map((section, i) => (
        <SectionRenderer key={i} section={section} phase={lesson.phase} />
      ))}

      {/* Divider before tasks */}
      <div className="my-10 flex items-center gap-4">
        <div className="flex-1 h-px bg-sa-border" />
        <div
          className="w-2 h-2 rotate-45"
          style={{ backgroundColor: accentColor, opacity: 0.5 }}
        />
        <div className="flex-1 h-px bg-sa-border" />
      </div>

      {/* Tasks section */}
      <div className="mb-8">
        <h3 className="font-serif text-xl text-sa-cream mb-2">What to do today</h3>
        {lesson.tasksSubtitle && (
          <p className="text-xs text-sa-cream-faint mb-5">{lesson.tasksSubtitle}</p>
        )}
        <div className="space-y-3">
          {lesson.tasks.map((task, i) => (
            <div
              key={i}
              className="p-4 rounded-sa border border-sa-border bg-sa-bg-warm"
            >
              <div className="text-sm font-medium text-sa-cream mb-1">{task.name}</div>
              <HtmlContent
                html={task.description}
                className="text-xs text-sa-cream-muted leading-relaxed [&>strong]:text-sa-cream-soft [&>strong]:font-medium"
              />
              {task.hint && (
                <div className="mt-2 text-xs text-sa-cream-faint italic">{task.hint}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Closing */}
      {lesson.closingParagraphs && lesson.closingParagraphs.length > 0 && (
        <div className="mt-10 mb-6">
          {lesson.closingParagraphs.map((p, i) => (
            <HtmlContent
              key={i}
              html={p}
              className="text-sm text-sa-cream-muted leading-relaxed mb-3 last:mb-0 [&>strong]:text-sa-cream [&>strong]:font-medium"
            />
          ))}
        </div>
      )}
    </div>
  );
}
