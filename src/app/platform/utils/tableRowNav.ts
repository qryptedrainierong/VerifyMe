/** Skip row navigation when the click originated from interactive controls (platform list tables). */
export function shouldIgnoreRowOpenClick(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return (
    target.closest(
      "button,a,input,textarea,select,label,[role='button'],[role='menu'],[role='menuitem'],[role='listbox'],[role='option'],[role='tab'],[data-no-row-nav]",
    ) !== null
  );
}
