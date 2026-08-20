import sys
path = "/Users/Deleted Extra/PW Posters/src/components/PosterForm.tsx"
with open(path, "r") as f:
    content = f.read()

# Fix 10: imports
content = content.replace("  SyllabusType,\n", "")
content = content.replace("import { CANVA_FONTS, BRAND_COLORS } from '../data/fonts';", "import { CANVA_FONTS } from '../data/fonts';")
content = content.replace("  Table as TableIcon,\n", "")
content = content.replace("  Palette,\n", "")
content = content.replace("  Calendar,\n", "")
content = content.replace("  Layers,\n", "")
content = content.replace("  Megaphone,\n", "")
content = content.replace("  Check,\n", "")
content = content.replace("  Info,\n", "")

# unused ref
content = content.replace("  const megaphoneFileInputRef = useRef<HTMLInputElement>(null);\n", "")

# Fix 6: file input not resettable
file_input_find = """    reader.readAsDataURL(file);
  };"""
file_input_repl = """    reader.readAsDataURL(file);
    e.target.value = '';
  };"""
content = content.replace(file_input_find, file_input_repl)

# Fix 2 & 3 & 4: Weekday case mismatch and double dispatch and batchName in handleTypeChange
type_change_find = """        numCols: 2,
        theme: 'maroon-pw',
        tableData: [
          ['DAYS', ''],
          ['MONDAY', ''],
          ['TUESDAY', ''],
          ['WEDNESDAY', ''],
          ['THURSDAY', ''],
          ['FRIDAY', ''],
          ['SATURDAY', '']
        ]
      });
      onDimensionsChange(7, 2);
    } else if (type === 'announcement') {
      onChange({
        type: 'announcement',
        batchName: config.type === 'announcement' ? config.batchName : '',
        title: '',
        startDate: '',
        endDate: '',
        numRows: 1,
        numCols: 1,
        theme: 'emerald-pw',
        announcementBadge: config.announcementBadge ? config.announcementBadge.toUpperCase() : 'KEEP LEARNING !!',
        announcementText: config.announcementText ? config.announcementText.toUpperCase() : 'LIVE CLASSES WILL RESUME TOMORROW AT 8:00 AM SHARP ON PW APP.',
        tableData: [['']]
      });
      onDimensionsChange(1, 1);
    } else {
      onChange({
        type: 'syllabus',
        syllabusType: 'Long',
        batchName: config.batchName || '',
        title: config.title || '',
        startDate: config.startDate || '',
        endDate: '',
        numRows: 3,
        numCols: 2,
        theme: 'purple-pw',
        tableData: [
          ['Subject', 'Topics'],
          ['Subject', 'Topics'],
          ['Subject', 'Topics']
        ]
      });
      onDimensionsChange(3, 2);
    }"""
type_change_repl = """        numCols: 2,
        theme: 'maroon-pw',
        tableData: [
          ['Days', ''],
          ['Monday', ''],
          ['Tuesday', ''],
          ['Wednesday', ''],
          ['Thursday', ''],
          ['Friday', ''],
          ['Saturday', '']
        ]
      });
    } else if (type === 'announcement') {
      onChange({
        type: 'announcement',
        batchName: config.batchName || '',
        title: '',
        startDate: '',
        endDate: '',
        numRows: 1,
        numCols: 1,
        theme: 'emerald-pw',
        announcementBadge: config.announcementBadge ? config.announcementBadge.toUpperCase() : 'KEEP LEARNING !!',
        announcementText: config.announcementText ? config.announcementText.toUpperCase() : 'LIVE CLASSES WILL RESUME TOMORROW AT 8:00 AM SHARP ON PW APP.',
        tableData: [['']]
      });
    } else {
      onChange({
        type: 'syllabus',
        syllabusType: 'Long',
        batchName: config.batchName || '',
        title: config.title || '',
        startDate: config.startDate || '',
        endDate: '',
        numRows: 3,
        numCols: 2,
        theme: 'purple-pw',
        tableData: [
          ['Subject', 'Topics'],
          ['Subject', 'Topics'],
          ['Subject', 'Topics']
        ]
      });
    }"""
content = content.replace(type_change_find, type_change_repl)

# Fix 5 & 2: handleClearForm
clear_form_find = """      if (config.type === 'timetable') {
        onChange({
          batchName: '',
          title: '',
          startDate: '',
          endDate: '',
          tableData: [
            ['DAYS', ''],
            ['MONDAY', ''],
            ['TUESDAY', ''],
            ['WEDNESDAY', ''],
            ['THURSDAY', ''],
            ['FRIDAY', ''],
            ['SATURDAY', '']
          ]
        });
      } else if (config.type === 'announcement') {
        onChange({
          batchName: '',
          announcementText: '',
          announcementBadge: 'KEEP LEARNING !!'
        });
      } else {
        onChange({
          batchName: '',
          title: '',
          startDate: '',
          tableData: [
            ['', ''],
            ['', ''],
            ['', '']
          ]
        });
      }"""
clear_form_repl = """      if (config.type === 'timetable') {
        onChange({
          batchName: '',
          title: '',
          startDate: '',
          endDate: '',
          numRows: 7,
          numCols: 2,
          tableData: [
            ['Days', ''],
            ['Monday', ''],
            ['Tuesday', ''],
            ['Wednesday', ''],
            ['Thursday', ''],
            ['Friday', ''],
            ['Saturday', '']
          ]
        });
      } else if (config.type === 'announcement') {
        onChange({
          batchName: '',
          announcementText: '',
          announcementBadge: 'KEEP LEARNING !!'
        });
      } else {
        onChange({
          batchName: '',
          title: '',
          startDate: '',
          numRows: 3,
          numCols: 2,
          tableData: [
            ['', ''],
            ['', ''],
            ['', '']
          ]
        });
      }"""
content = content.replace(clear_form_find, clear_form_repl)

# Fix 3: row and col onDimensionsChange
add_row_find = """    onChange({ tableData: newData, numRows: config.numRows + 1 });
    onDimensionsChange(config.numRows + 1, config.numCols);
  };"""
add_row_repl = """    onChange({ tableData: newData, numRows: config.numRows + 1 });
  };"""
content = content.replace(add_row_find, add_row_repl)

remove_row_find = """    onChange({ tableData: newData, numRows: config.numRows - 1 });
    onDimensionsChange(config.numRows - 1, config.numCols);
  };"""
remove_row_repl = """    onChange({ tableData: newData, numRows: config.numRows - 1 });
  };"""
content = content.replace(remove_row_find, remove_row_repl)

add_col_find = """    onChange({ tableData: newData, numCols: config.numCols + 1 });
    onDimensionsChange(config.numRows, config.numCols + 1);
  };"""
add_col_repl = """    onChange({ tableData: newData, numCols: config.numCols + 1 });
  };"""
content = content.replace(add_col_find, add_col_repl)

rem_col_find = """    onChange({ tableData: newData, numCols: config.numCols - 1 });
    onDimensionsChange(config.numRows, config.numCols - 1);
  };"""
rem_col_repl = """    onChange({ tableData: newData, numCols: config.numCols - 1 });
  };"""
content = content.replace(rem_col_find, rem_col_repl)

# Fix 11: as PosterConfig['batchNameFontWeight']
weight_find = "onChange={(e) => onChange({ batchNameFontWeight: e.target.value as any })}"
weight_repl = "onChange={(e) => onChange({ batchNameFontWeight: e.target.value as PosterConfig['batchNameFontWeight'] })}"
content = content.replace(weight_find, weight_repl)

# Fix 7: table font default adjustments
th_minus_find = "onClick={() => adjustFontSize('tableHeaderFontSize', -1, 19, 12, 32)}"
th_minus_repl = "onClick={() => adjustFontSize('tableHeaderFontSize', -1, 18, 12, 32)}"
content = content.replace(th_minus_find, th_minus_repl)

th_plus_find = "onClick={() => adjustFontSize('tableHeaderFontSize', 1, 19, 12, 32)}"
th_plus_repl = "onClick={() => adjustFontSize('tableHeaderFontSize', 1, 18, 12, 32)}"
content = content.replace(th_plus_find, th_plus_repl)

tc_minus_find = "onClick={() => adjustFontSize('tableCellFontSize', -1, 17, 10, 30)}"
tc_minus_repl = "onClick={() => adjustFontSize('tableCellFontSize', -1, 16, 10, 30)}"
content = content.replace(tc_minus_find, tc_minus_repl)

tc_plus_find = "onClick={() => adjustFontSize('tableCellFontSize', 1, 17, 10, 30)}"
tc_plus_repl = "onClick={() => adjustFontSize('tableCellFontSize', 1, 16, 10, 30)}"
content = content.replace(tc_plus_find, tc_plus_repl)

# Fix 8: font reset
reset_find = """                  onChange({
                    fontFamily: CANVA_FONTS[0].family,
                    batchNameFontSize: undefined,
                    titleFontSize: undefined,
                    dateFontSize: undefined,
                    tableHeaderFontSize: undefined,
                    tableCellFontSize: undefined,
                    tableCellAlign: 'center',
                    globalFontScale: 1.0,
                    headerGap: 5
                  })"""
reset_repl = """                  onChange({
                    fontFamily: CANVA_FONTS[0].family,
                    batchNameFontSize: undefined,
                    titleFontSize: undefined,
                    dateFontSize: undefined,
                    tableHeaderFontSize: undefined,
                    tableCellFontSize: undefined,
                    batchNameFontWeight: '800',
                    announcementFontSize: undefined,
                    tableHeaderFontWeight: '800',
                    tableCellFontWeight: '600',
                    tableCellAlign: 'center',
                    globalFontScale: 1.0,
                    headerGap: 5
                  })"""
content = content.replace(reset_find, reset_repl)

# Fix 1: Custom logo upload
logo_find = """                <input
                  type="file"
                  ref={logoFileInputRef}
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'customLogoUrl')}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoFileInputRef.current?.click()}
                  className="w-full py-2 px-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{config.customLogoUrl ? 'Change Custom Logo' : 'Upload Custom Logo'}</span>
                </button>"""
logo_repl = """                <input
                  type="file"
                  ref={logoFileInputRef}
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'customLogoUrl', { logoStyleMode: 'custom' })}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoFileInputRef.current?.click()}
                  className="w-full py-2 px-3 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{config.customLogoUrl ? 'Change Custom Logo' : 'Upload Custom Logo'}</span>
                </button>
                {config.customLogoUrl && (
                  <button
                    type="button"
                    onClick={() => onChange({ customLogoUrl: undefined, logoStyleMode: 'pw-official-img' })}
                    className="text-xs text-red-600 hover:text-red-800 font-bold"
                  >
                    Remove Custom Logo
                  </button>
                )}"""
content = content.replace(logo_find, logo_repl)

# Fix 9: Modal row limit
modal_add_find = """              <button
                type="button"
                onClick={addRow}
                className="px-4 py-2 bg-purple-50 text-purple-800 font-bold text-xs rounded-xl"
              >
                + Add Row
              </button>"""
modal_add_repl = """              <button
                type="button"
                onClick={addRow}
                disabled={config.numRows >= 12}
                className="px-4 py-2 bg-purple-50 text-purple-800 font-bold text-xs rounded-xl disabled:opacity-50"
              >
                + Add Row
              </button>"""
content = content.replace(modal_add_find, modal_add_repl)

with open(path, "w") as f:
    f.write(content)
