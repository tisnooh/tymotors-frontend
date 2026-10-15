import React from 'react';
import { useTranslation } from 'react-i18next';

export function VehicleDetails({ generation, details, onChange, disabled }) {
  const { t } = useTranslation();
  const update = (field, value) => onChange(current => ({ ...current, [field]: value }));
  return <fieldset disabled={disabled} className="customize-details" data-testid="customize-details">
    <legend>{t('customize.project.details_title')}</legend>
    <p>{t('customize.project.details_hint')}</p>
    <div className="customize-detail-fields">
      <label>{t('customize.project.year')}<input type="number" min={generation.year_from || 1950} max={generation.year_to || new Date().getFullYear() + 1} step="1" value={details.year} onChange={e => update('year', e.target.value)} placeholder="2020" data-testid="customize-year" /></label>
      <label>{t('customize.project.body')}<input type="text" maxLength={100} list="customize-body-options" value={details.body_type} onChange={e => update('body_type', e.target.value)} placeholder={t('customize.project.optional')} data-testid="customize-body" /></label>
      <datalist id="customize-body-options">{(generation.body_types || []).map(value => <option key={value} value={value} />)}</datalist>
      <label>{t('customize.project.trim')}<input type="text" maxLength={100} list="customize-trim-options" value={details.trim} onChange={e => update('trim', e.target.value)} placeholder={t('customize.project.optional')} data-testid="customize-trim" /></label>
      <datalist id="customize-trim-options">{(generation.trims || []).map(value => <option key={value} value={value} />)}</datalist>
      {['has_camera', 'has_parking_sensors'].map(field => <label key={field}>{t(`customize.project.${field}`)}<select value={details[field] == null ? '' : String(details[field])} onChange={e => update(field, e.target.value === '' ? null : e.target.value === 'true')}><option value="">{t('customize.project.unsure')}</option><option value="true">{t('customize.project.yes')}</option><option value="false">{t('customize.project.no')}</option></select></label>)}
    </div>
  </fieldset>;
}
