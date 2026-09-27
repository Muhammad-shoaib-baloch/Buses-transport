import SiteLayout from './(site)/layout';
import NotFoundBody from './(site)/not-found';

/* Unmatched multi-segment URLs land here; render them inside the site chrome. */
export default function NotFound() {
  return (
    <SiteLayout>
      <NotFoundBody />
    </SiteLayout>
  );
}
