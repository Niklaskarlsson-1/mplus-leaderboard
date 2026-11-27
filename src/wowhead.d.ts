// Wowheads tooltip-skript (laddas i index.html) lägger till ett globalt objekt.
interface Window {
  $WowheadPower?: { refreshLinks: () => void };
}
