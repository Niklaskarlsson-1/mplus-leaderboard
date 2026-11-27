import { useEffect } from 'react';
import { iconUrl } from '../lib/api.ts';
import type { GearItem, GearSlot } from '../lib/types.ts';
import { qualityColor } from '../lib/wow.ts';

// Samma uppställning som karaktärsfönstret i spelet.
const LEFT: GearSlot[] = ['head', 'neck', 'shoulder', 'back', 'chest', 'wrist'];
const RIGHT: GearSlot[] = ['hands', 'waist', 'legs', 'feet', 'finger1', 'finger2', 'trinket1', 'trinket2'];
const WEAPONS: GearSlot[] = ['mainhand', 'offhand'];

const SLOT_LABELS: Record<GearSlot, string> = {
  head: 'Huvud',
  neck: 'Hals',
  shoulder: 'Axlar',
  back: 'Mantel',
  chest: 'Bröst',
  wrist: 'Handleder',
  hands: 'Händer',
  waist: 'Midja',
  legs: 'Ben',
  feet: 'Fötter',
  finger1: 'Ring',
  finger2: 'Ring',
  trinket1: 'Trinket',
  trinket2: 'Trinket',
  mainhand: 'Huvudhand',
  offhand: 'Andra hand',
};

/**
 * Wowhead läser data-wowhead och visar exakt rätt version av föremålet
 * (item level, bonusar, gems och enchant) i sin tooltip.
 */
function wowheadData(item: GearItem): string {
  const parts = [`item=${item.item_id}`, `ilvl=${item.item_level}`];
  if (item.bonuses.length) parts.push(`bonus=${item.bonuses.join(':')}`);
  if (item.gems.length) parts.push(`gems=${item.gems.join(':')}`);
  if (item.enchants.length) parts.push(`ench=${item.enchants.join(':')}`);
  return parts.join('&');
}

function GearRow({ slot, item }: { slot: GearSlot; item?: GearItem }) {
  if (!item) {
    return (
      <li className="gear-row empty-slot">
        <span className="gear-icon placeholder" />
        <span className="gear-info">
          <span className="gear-slot">{SLOT_LABELS[slot]}</span>
          <span className="muted">Tom</span>
        </span>
      </li>
    );
  }

  const color = qualityColor(item.item_quality);
  const extras = [
    ...item.enchants_detail.map((e) => e.name.replace(/^Enchant \w+ - /, '')),
    ...item.gems_detail.map((g) => g.name),
  ];

  return (
    <li className="gear-row">
      <a
        className="gear-link"
        href={`https://www.wowhead.com/item=${item.item_id}`}
        data-wowhead={wowheadData(item)}
        target="_blank"
        rel="noreferrer"
      >
        <span className="gear-icon" style={{ borderColor: color }}>
          <img src={iconUrl(item.icon)} alt="" width={40} height={40} loading="lazy" />
          <span className="gear-ilvl">{item.item_level}</span>
        </span>
        <span className="gear-info">
          <span className="gear-name" style={{ color }}>{item.name}</span>
          <span className="gear-extra">
            <span className="gear-slot">{SLOT_LABELS[slot]}</span>
            {extras.length > 0 && <span className="gear-enchant"> · {extras.join(' · ')}</span>}
          </span>
        </span>
      </a>
    </li>
  );
}

export function Gear({ items, itemLevel }: { items: Partial<Record<GearSlot, GearItem>>; itemLevel: number }) {
  // Be Wowhead leta upp nya länkar när utrustningen har ritats ut.
  useEffect(() => {
    window.$WowheadPower?.refreshLinks();
  }, [items]);

  const weapons = WEAPONS.filter((s) => items[s]);

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Utrustning</h2>
        <span className="ilvl-badge">{itemLevel} item level</span>
      </div>
      <div className="gear-grid">
        <ul className="gear-col">
          {LEFT.map((s) => <GearRow key={s} slot={s} item={items[s]} />)}
        </ul>
        <ul className="gear-col">
          {RIGHT.map((s) => <GearRow key={s} slot={s} item={items[s]} />)}
        </ul>
      </div>
      <ul className="gear-weapons">
        {(weapons.length ? weapons : (['mainhand'] as GearSlot[])).map((s) => (
          <GearRow key={s} slot={s} item={items[s]} />
        ))}
      </ul>
      <p className="muted small">Håll musen över ett föremål för att se dess stats.</p>
    </section>
  );
}
