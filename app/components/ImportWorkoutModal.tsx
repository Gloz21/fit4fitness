import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ModalSafeArea } from '@/components/modal-safe-area';
import { exerciseCatalog } from '../lib/exercises';
import { exerciseStore } from '../lib/exerciseStore';
import { useUnits, weightUnitFor } from '../lib/units';
import { buildDraftWorkout, googleExportUrl, ImportResult, parseWorkoutText } from '../lib/workoutImport';
import type { Workout } from '../lib/workouts';

type Source = 'paste' | 'link' | 'file';

const SOURCES: { key: Source; label: string }[] = [
  { key: 'paste', label: 'Paste Text' },
  { key: 'link', label: 'Google Link' },
  { key: 'file', label: 'File' },
];

const SOURCE_LABEL: Record<Source, string> = {
  paste: 'pasted text',
  link: 'a Google Doc or Sheet',
  file: 'a file',
};

const EXAMPLE = `Push Day
Bench Press 4x8 @ 185
Incline DB Press 3x10 60 lbs
Overhead Press 3 sets of 8, rest 2 min
Lateral Raises 3x15`;

interface ImportWorkoutModalProps {
  visible: boolean;
  onClose: () => void;
  onImport: (draft: Workout) => void;
}

export default function ImportWorkoutModal({ visible, onClose, onImport }: ImportWorkoutModalProps) {
  const units = useUnits();
  const [source, setSource] = useState<Source>('paste');
  const [text, setText] = useState('');
  const [link, setLink] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showSkipped, setShowSkipped] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setSource('paste');
    setText('');
    setLink('');
    setFileName(null);
    setError('');
    setResult(null);
    setShowSkipped(false);
  }, [visible]);

  const readText = (input: string) => {
    const catalog = [...exerciseCatalog, ...exerciseStore.getCustomExercises()];
    const parsed = parseWorkoutText(input, catalog, weightUnitFor(units));
    if (parsed.lines.length === 0) {
      setResult(null);
      setError(
        'No exercises found. Put each exercise on its own line with a name and sets × reps, for example "Bench Press 3x10 @ 135".'
      );
      return;
    }
    setError('');
    setResult(parsed);
  };

  const loadLink = async () => {
    const url = googleExportUrl(link.trim());
    if (!url) {
      setError('That doesn’t look like a Google Docs or Google Sheets link. Copy the link from the Share menu and paste it here.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(url);
      const body = await res.text();
      const isPage = /^\s*<(!doctype|html)/i.test(body);
      if (!res.ok || isPage) {
        setError(
          'Couldn’t open that file. In Google Docs or Sheets, tap Share, set General access to “Anyone with the link”, then try again.'
        );
        return;
      }
      setText(body);
      readText(body);
    } catch {
      setError('Couldn’t reach Google. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const pickFile = async () => {
    setError('');
    const picked = await DocumentPicker.getDocumentAsync({
      type: ['text/plain', 'text/csv', 'text/comma-separated-values', 'text/tab-separated-values', 'application/csv'],
      copyToCacheDirectory: true,
    });
    if (picked.canceled || !picked.assets?.[0]) return;
    const asset = picked.assets[0];
    setLoading(true);
    setResult(null);
    try {
      const body = await new File(asset.uri).text();
      setFileName(asset.name);
      setText(body);
      readText(body);
    } catch {
      setError('Couldn’t read that file. Choose a .txt or .csv file, or export your sheet as CSV first.');
    } finally {
      setLoading(false);
    }
  };

  const formatLine = (line: ImportResult['lines'][number]) => {
    const e = line.exercise;
    const parts = [`${e.sets} × ${e.reps}`];
    if (e.weight) parts.push(`${e.weight} ${e.unit}`);
    parts.push(`rest ${e.restSeconds >= 60 && e.restSeconds % 60 === 0 ? `${e.restSeconds / 60} min` : `${e.restSeconds}s`}`);
    return parts.join(' · ');
  };

  const matchedCount = result?.lines.filter((l) => l.matched).length ?? 0;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ModalSafeArea style={styles.screen}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Import a Workout</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.tabs}>
              {SOURCES.map((s) => (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.tab, source === s.key && styles.tabActive]}
                  onPress={() => {
                    setSource(s.key);
                    setError('');
                    setResult(null);
                  }}
                >
                  <Text style={[styles.tabText, source === s.key && styles.tabTextActive]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {source === 'paste' && (
              <View style={styles.section}>
                <Text style={styles.label}>Paste your workout, one exercise per line</Text>
                <TextInput
                  style={styles.textArea}
                  multiline
                  value={text}
                  onChangeText={(t) => {
                    setText(t);
                    setResult(null);
                  }}
                  placeholder={EXAMPLE}
                  placeholderTextColor="#AAA"
                  autoCorrect={false}
                  textAlignVertical="top"
                />
                <View style={styles.tip}>
                  <Text style={styles.tipTitle}>Workout on paper or in a screenshot?</Text>
                  <Text style={styles.tipText}>
                    Take a photo, open it in Photos, then press and hold on the text and tap Copy (or Select All, then Copy). Paste it here.
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.primaryButton, !text.trim() && styles.buttonDisabled]}
                  disabled={!text.trim()}
                  onPress={() => readText(text)}
                >
                  <Text style={styles.primaryButtonText}>Read Workout</Text>
                </TouchableOpacity>
              </View>
            )}

            {source === 'link' && (
              <View style={styles.section}>
                <Text style={styles.label}>Google Docs or Google Sheets link</Text>
                <TextInput
                  style={styles.input}
                  value={link}
                  onChangeText={setLink}
                  placeholder="https://docs.google.com/…"
                  placeholderTextColor="#AAA"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
                <Text style={styles.hint}>
                  The file must be shared as “Anyone with the link”. For a sheet with several tabs, open the tab you want before copying the link.
                </Text>
                <TouchableOpacity
                  style={[styles.primaryButton, (!link.trim() || loading) && styles.buttonDisabled]}
                  disabled={!link.trim() || loading}
                  onPress={loadLink}
                >
                  <Text style={styles.primaryButtonText}>Load Workout</Text>
                </TouchableOpacity>
              </View>
            )}

            {source === 'file' && (
              <View style={styles.section}>
                <Text style={styles.label}>Text or spreadsheet file</Text>
                <Text style={styles.hint}>
                  Choose a .txt or .csv file. For Excel or Numbers, export the sheet as CSV first. Spreadsheets work best with columns like Exercise, Sets, Reps, Weight, Rest.
                </Text>
                <TouchableOpacity style={[styles.primaryButton, loading && styles.buttonDisabled]} disabled={loading} onPress={pickFile}>
                  <Text style={styles.primaryButtonText}>{fileName ? 'Choose a Different File' : 'Choose File'}</Text>
                </TouchableOpacity>
                {fileName && <Text style={styles.fileName}>Loaded: {fileName}</Text>}
              </View>
            )}

            {loading && <ActivityIndicator color="#00B8A9" style={{ marginTop: 8 }} />}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            {result && (
              <View style={styles.preview}>
                <Text style={styles.previewTitle}>{result.title ?? 'Imported Workout'}</Text>
                <Text style={styles.previewSummary}>
                  {result.lines.length} {result.lines.length === 1 ? 'exercise' : 'exercises'} found
                  {matchedCount > 0 ? ` · ${matchedCount} matched to the exercise library` : ''}
                </Text>

                {result.lines.map((line, i) => {
                  const startsGroup = !!line.group && result.lines[i - 1]?.group !== line.group;
                  const groupSize = startsGroup
                    ? result.lines.slice(i).findIndex((l) => l.group !== line.group) === -1
                      ? result.lines.length - i
                      : result.lines.slice(i).findIndex((l) => l.group !== line.group)
                    : 0;
                  return (
                  <React.Fragment key={i}>
                  {startsGroup && (
                    <Text style={styles.groupLabel}>
                      🔥 {line.group} · superset of {groupSize}, done back-to-back
                    </Text>
                  )}
                  <View style={[styles.row, line.group ? styles.rowInGroup : null]}>
                    <View style={[styles.rowDot, line.matched ? styles.dotMatched : styles.dotNew]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowName}>{line.exercise.exerciseName}</Text>
                      <Text style={styles.rowDetail}>{formatLine(line)}</Text>
                      {line.exercise.notes ? <Text style={styles.rowNote}>{line.exercise.notes}</Text> : null}
                      {!line.matched && <Text style={styles.rowFlag}>New exercise, added to your exercises when you save</Text>}
                      {line.usedDefaults && <Text style={styles.rowFlag}>No sets or reps found, using 3 × 10</Text>}
                    </View>
                  </View>
                  </React.Fragment>
                  );
                })}

                {result.skipped.length > 0 && (
                  <View style={styles.skipped}>
                    <TouchableOpacity onPress={() => setShowSkipped((v) => !v)}>
                      <Text style={styles.skippedToggle}>
                        {showSkipped ? 'Hide' : 'Show'} {result.skipped.length} {result.skipped.length === 1 ? 'line' : 'lines'} that weren’t exercises
                      </Text>
                    </TouchableOpacity>
                    {showSkipped &&
                      result.skipped.map((s, i) => (
                        <Text key={i} style={styles.skippedLine}>
                          {s}
                        </Text>
                      ))}
                  </View>
                )}

                <Text style={styles.hint}>You can change anything on the next screen before saving.</Text>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => onImport(buildDraftWorkout(result, SOURCE_LABEL[source]))}
                >
                  <Text style={styles.primaryButtonText}>Review in Workout Builder</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </ModalSafeArea>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  close: {
    fontSize: 22,
    color: '#666',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  content: {
    padding: 20,
    paddingBottom: 48,
    gap: 16,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#00B8A9',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
  },
  tabTextActive: {
    color: '#FFF',
  },
  section: {
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  textArea: {
    minHeight: 170,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    lineHeight: 21,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
  },
  hint: {
    fontSize: 13,
    color: '#777',
    lineHeight: 18,
  },
  tip: {
    backgroundColor: '#F0FBFA',
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00796B',
  },
  tipText: {
    fontSize: 13,
    color: '#335F5A',
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: '#00B8A9',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  fileName: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  error: {
    color: '#C0392B',
    backgroundColor: '#FDECEC',
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  preview: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  previewSummary: {
    fontSize: 13,
    color: '#00B8A9',
    fontWeight: '600',
    marginTop: -8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  rowInGroup: {
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B35',
    paddingLeft: 8,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF6B35',
    marginTop: 4,
  },
  rowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  dotMatched: {
    backgroundColor: '#00B8A9',
  },
  dotNew: {
    backgroundColor: '#F0A500',
  },
  rowName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  rowDetail: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
  rowNote: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
    fontStyle: 'italic',
  },
  rowFlag: {
    fontSize: 12,
    color: '#B07500',
    marginTop: 2,
  },
  skipped: {
    gap: 4,
  },
  skippedToggle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00B8A9',
  },
  skippedLine: {
    fontSize: 12,
    color: '#888',
  },
});
