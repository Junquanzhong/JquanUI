const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const component = path.join(root, 'dist', 'components', 'dateTimePicker.js');
const manifest = path.join(root, 'dist', 'components', 'components.manifest.json');
const form = path.join(root, 'projects', 'guanlan-console', 'pages', 'form.html');

if (!fs.existsSync(component)) throw new Error('missing dateTimePicker.js');
const source = fs.readFileSync(component, 'utf8');
for (const token of [
  'components.dateTimePickerApi',
  'components.dateTimePicker',
  'data-jq-date-time-picker',
  'datetime-local',
  'jq-dtp-calendar-grid',
  'jq-dtp-time-column'
]) {
  if (!source.includes(token)) throw new Error(`date time picker missing contract: ${token}`);
}

const manifestData = JSON.parse(fs.readFileSync(manifest, 'utf8'));
if (!manifestData.components.includes('dateTimePicker.js')) throw new Error('component manifest is missing dateTimePicker.js');

const formHtml = fs.readFileSync(form, 'utf8');
if (!formHtml.includes('dist/components/dateTimePicker.js')) throw new Error('Guanlan form does not load dateTimePicker.js');
if ((formHtml.match(/data-jq-date-time-picker/g) || []).length < 2) throw new Error('Guanlan form needs date and datetime picker examples');
const nativePickerInputs = formHtml.match(/<input\b[^>]*\btype="(?:date|time|datetime-local)"[^>]*>/gi) || [];
if (nativePickerInputs.some((input) => !/data-jq-date-time-picker\b/.test(input))) {
  throw new Error('native date/time input remains without the custom picker marker');
}

console.log('date time picker verification passed');
