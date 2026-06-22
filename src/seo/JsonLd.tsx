import { useJsonLd } from './useJsonLd';

type JsonLdProps = {
  /** Stable DOM script id suffix (becomes petclues-structured-data-{id}). */
  id: string;
  data: object;
};

/** Declarative JSON-LD injection for any schema graph or node. */
export function JsonLd({ id, data }: JsonLdProps) {
  useJsonLd(id, data);
  return null;
}
