import { SpaceRedirect } from '@/modules/spaces';

/** The reminder email's link: it can't know the space, so open «Регулярні» of the last one. */
export default function RecurringLink() {
  return <SpaceRedirect section="recurring" />;
}
