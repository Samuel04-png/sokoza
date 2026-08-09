"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Icon } from "@/components/icon";
import { SmartImage } from "@/components/smart-image";
import {
  type DiscoverSuggestion,
  type DiscoverSuggestionGroup,
  type DiscoverSuggestionSource,
  localDiscoverSuggestionSource,
} from "@/lib/discover-search";
import { formatPrice } from "@/lib/format";
import type { Drop, Product, Store } from "@/lib/types";

const SUGGESTION_DELAY = 180;

interface RichDiscoverSearchProps {
  autoFocus?: boolean;
  containerClassName?: string;
  drops: Drop[];
  formClassName: string;
  inputId: string;
  label: string;
  onFocus?: () => void;
  onQueryChange: (query: string) => void;
  onSearch: (query: string) => void;
  placeholder: string;
  products: Product[];
  query: string;
  rowClassName?: string;
  stores: Store[];
  submitClassName?: string;
  suggestionSource?: DiscoverSuggestionSource;
  trailingAction?: ReactNode;
}

function HighlightedText({ query, text }: { query: string; text: string }) {
  const tokens = query.trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return text;
  const expression = new RegExp(
    `(${tokens.map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi",
  );

  return text.split(expression).map((part, index) =>
    tokens.some((token) => token.toLocaleLowerCase() === part.toLocaleLowerCase()) ? (
      <mark key={`${part}-${index}`}>{part}</mark>
    ) : (
      part
    ),
  );
}

function availabilityCopy(suggestion: Extract<DiscoverSuggestion, { type: "product" }>) {
  if (suggestion.availability === "low") return "Low stock";
  if (suggestion.availability === "stale") return "Check availability";
  return "Available";
}

function SuggestionVisual({ suggestion }: { suggestion: DiscoverSuggestion }) {
  if (suggestion.type === "product") {
    return (
      <span className="suggestion-image product-suggestion-image">
        <SmartImage alt="" fill sizes="56px" src={suggestion.image} />
      </span>
    );
  }
  if (suggestion.type === "store") {
    return (
      <span className="suggestion-image store-suggestion-image">
        <SmartImage alt="" fill sizes="48px" src={suggestion.image} />
      </span>
    );
  }
  if (suggestion.type === "drop") {
    return (
      <span className="suggestion-image drop-suggestion-image">
        <SmartImage alt="" fill sizes="56px" src={suggestion.image} />
      </span>
    );
  }
  return (
    <span className="suggestion-icon">
      <Icon name={suggestion.type === "category" ? "store" : "discover"} size={20} />
    </span>
  );
}

function SuggestionMeta({ suggestion }: { suggestion: DiscoverSuggestion }) {
  if (suggestion.type === "product") {
    return (
      <span className="suggestion-meta">
        <span>{suggestion.storeName}</span>
        <span aria-hidden="true">·</span>
        <span>{formatPrice(suggestion.price)}</span>
        <span aria-hidden="true">·</span>
        <span>{availabilityCopy(suggestion)}</span>
      </span>
    );
  }
  if (suggestion.type === "store") {
    return (
      <span className="suggestion-meta">
        <span>{suggestion.location}</span>
        {suggestion.descriptor ? (
          <>
            <span aria-hidden="true">·</span>
            <span>{suggestion.descriptor}</span>
          </>
        ) : null}
      </span>
    );
  }
  if (suggestion.type === "drop") {
    return <span className="suggestion-meta">Drop by {suggestion.storeName}</span>;
  }
  return (
    <span className="suggestion-meta">
      {suggestion.type === "category" ? "Category" : "Vibe"}
    </span>
  );
}

export function RichDiscoverSearch({
  autoFocus = false,
  containerClassName = "",
  drops,
  formClassName,
  inputId,
  label,
  onFocus,
  onQueryChange,
  onSearch,
  placeholder,
  products,
  query,
  rowClassName = "",
  stores,
  submitClassName,
  suggestionSource = localDiscoverSuggestionSource,
  trailingAction,
}: RichDiscoverSearchProps) {
  const router = useRouter();
  const [suggestionGroups, setSuggestionGroups] = useState<DiscoverSuggestionGroup[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(true);
  const [suggestionsBusy, setSuggestionsBusy] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const flatSuggestions = useMemo(
    () => suggestionGroups.flatMap((group) => group.items),
    [suggestionGroups],
  );
  const cleanQuery = query.trim();
  const showSuggestionPanel = suggestionsOpen && cleanQuery.length > 0;
  const suggestionListId = `${inputId}-suggestions`;

  useEffect(() => {
    if (cleanQuery.length < 2) {
      queueMicrotask(() => {
        setSuggestionGroups([]);
        setSuggestionsBusy(false);
      });
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const groups = await suggestionSource.suggest({
          drops,
          products,
          query: cleanQuery,
          signal: controller.signal,
          stores,
        });
        if (!controller.signal.aborted) setSuggestionGroups(groups);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setSuggestionGroups([]);
        }
      } finally {
        if (!controller.signal.aborted) setSuggestionsBusy(false);
      }
    }, SUGGESTION_DELAY);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [cleanQuery, drops, products, stores, suggestionSource]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cleanQuery) onSearch(cleanQuery);
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape" && showSuggestionPanel) {
      event.preventDefault();
      setSuggestionsOpen(false);
      setActiveSuggestion(-1);
      return;
    }
    if (!showSuggestionPanel || !flatSuggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestion((current) => (current + 1) % flatSuggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestion((current) =>
        current <= 0 ? flatSuggestions.length - 1 : current - 1,
      );
    } else if (event.key === "Enter" && activeSuggestion >= 0) {
      event.preventDefault();
      router.push(flatSuggestions[activeSuggestion].href);
    }
  }

  return (
    <div className={`rich-search-root ${containerClassName}`.trim()}>
      <div className={rowClassName || undefined}>
        <form className={formClassName} onSubmit={submit} role="search">
          <Icon name="search" size={20} />
          <label className="sr-only" htmlFor={inputId}>{label}</label>
          <input
            aria-activedescendant={activeSuggestion >= 0 ? `${inputId}-suggestion-${flatSuggestions[activeSuggestion]?.id}` : undefined}
            aria-autocomplete="list"
            aria-controls={suggestionListId}
            aria-expanded={showSuggestionPanel}
            autoComplete="off"
            autoFocus={autoFocus}
            id={inputId}
            onChange={(event) => {
              const nextQuery = event.target.value;
              onQueryChange(nextQuery);
              setSuggestionsOpen(true);
              setActiveSuggestion(-1);
              setSuggestionsBusy(nextQuery.trim().length >= 2);
            }}
            onFocus={() => {
              onFocus?.();
              setSuggestionsOpen(true);
            }}
            onKeyDown={handleSearchKeyDown}
            placeholder={placeholder}
            role="combobox"
            value={query}
          />
          {query ? (
            <button
              aria-label="Clear search"
              className="icon-button rich-search-clear"
              onClick={() => {
                onQueryChange("");
                setSuggestionsOpen(true);
              }}
              type="button"
            >
              <Icon name="close" size={19} />
            </button>
          ) : null}
          <button className={submitClassName} type="submit">Search</button>
        </form>
        {trailingAction}
      </div>

      {showSuggestionPanel ? (
        <section
          aria-busy={suggestionsBusy}
          aria-label="Search suggestions"
          className="suggestions grouped-suggestions rich-suggestions"
          id={suggestionListId}
          role="listbox"
        >
          {cleanQuery.length < 2 ? (
            <div className="suggestion-empty" role="status">
              <p>Type one more character to see matching stores and pieces.</p>
            </div>
          ) : suggestionGroups.length > 0 ? (
            <>
              {suggestionGroups.map((group) => {
                const headingId = `${inputId}-suggestion-group-${group.label.toLocaleLowerCase()}`;
                return (
                  <div aria-labelledby={headingId} className="suggestion-group" key={group.label} role="group">
                    <h2 id={headingId}>{group.label}</h2>
                    {group.items.map((suggestion) => {
                      const flatIndex = flatSuggestions.findIndex((item) => item.id === suggestion.id);
                      return (
                        <Link
                          aria-label={`${suggestion.label}, ${suggestion.type}`}
                          aria-selected={activeSuggestion === flatIndex}
                          className="rich-suggestion-row"
                          href={suggestion.href}
                          id={`${inputId}-suggestion-${suggestion.id}`}
                          key={suggestion.id}
                          onFocus={() => setActiveSuggestion(flatIndex)}
                          onMouseEnter={() => setActiveSuggestion(flatIndex)}
                          role="option"
                        >
                          <SuggestionVisual suggestion={suggestion} />
                          <span className="suggestion-copy">
                            <strong><HighlightedText query={cleanQuery} text={suggestion.label} /></strong>
                            <SuggestionMeta suggestion={suggestion} />
                          </span>
                          <Icon name="next" size={18} />
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
              <button
                aria-selected="false"
                className="suggestion-search-all"
                onClick={() => onSearch(cleanQuery)}
                role="option"
                type="button"
              >
                <span>See all results for “{cleanQuery}”</span>
                <Icon name="next" size={18} />
              </button>
            </>
          ) : suggestionsBusy ? (
            <div className="suggestion-empty" role="status"><p>Finding current stores and pieces…</p></div>
          ) : (
            <div className="suggestion-empty" role="status">
              <p>No close matches in the current catalog.</p>
              <button className="text-link" onClick={() => onSearch(cleanQuery)} type="button">
                Search all current pieces for “{cleanQuery}”
              </button>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
