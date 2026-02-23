import { StyleSheet, TextInput, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { apiClient, CaseResult } from '../../api';

const { width } = Dimensions.get('window');

const SYMPTOMS = [
  { key: "headache", label: "Severe Headache", danger: true },
  { key: "visual_disturbance", label: "Visual Disturbance", danger: true },
  { key: "epigastric_pain", label: "Epigastric Pain", danger: true },
  { key: "oedema", label: "Significant Oedema", danger: false },
  { key: "convulsions", label: "Convulsions / Seizures", danger: true },
  { key: "vaginal_bleeding", label: "Vaginal Bleeding", danger: true }
];

export default function HomeScreen() {
  // Global App State
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<CaseResult | null>(null);

  // Login State
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('demo1234');

  // Form State
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [ga, setGa] = useState('');
  const [sys, setSys] = useState('');
  const [dia, setDia] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const toggleSym = (k: string) => setSymptoms(s => s.includes(k) ? s.filter(x => x !== k) : [...s, k]);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await apiClient.login(username, password);
      setLoggedIn(true);
    } catch (e: any) {
      setError(e.message || 'Login Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRunTriage = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.submitCase({
        name,
        age: parseInt(age) || 0,
        gestational_age_weeks: parseInt(ga) || 0,
        vitals: { systolic: parseInt(sys) || 0, diastolic: parseInt(dia) || 0 },
        symptoms
      });
      setResult(res);
    } catch (e: any) {
      setError(e.message || 'Triage Failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName(''); setAge(''); setGa(''); setSys(''); setDia(''); setSymptoms([]);
    setStep(1); setResult(null);
  };

  if (!loggedIn) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ThemedText type="title" style={styles.headerTitle}>MaTriX-AI Login</ThemedText>
        <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#888" value={username} onChangeText={setUsername} />
        <TextInput style={[styles.input, { marginTop: 15 }]} placeholder="Password" placeholderTextColor="#888" secureTextEntry value={password} onChangeText={setPassword} />
        <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.primaryButtonText}>Sign In / Demo Access</Text>}
        </TouchableOpacity>
        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }

  if (result) {
    const r = result.risk_output;
    const g = result.guideline_output;
    const plan = result.executive_output;
    const isSevere = r.risk_level === 'severe';

    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={resetForm}><Text style={{ color: '#0ea5e9' }}>← New Triage</Text></TouchableOpacity>
        </View>

        <View style={[styles.card, { borderColor: isSevere ? 'rgba(244,63,94,0.4)' : 'rgba(6,182,212,0.3)' }]}>
          <ThemedText style={{ color: '#a1a1aa', fontSize: 12 }}>AI Risk Index</ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <ThemedText style={{ fontSize: 48, fontWeight: '900', color: isSevere ? '#f43f5e' : '#2dd4bf' }}>{Math.round(r.risk_score)}</ThemedText>
            <ThemedText style={{ fontSize: 18, color: '#52525b', marginLeft: 4 }}>%</ThemedText>
          </View>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, marginTop: 15 }}>
            <ThemedText style={{ color: '#c084fc', marginBottom: 5 }}>Clinical Reasoning</ThemedText>
            <ThemedText style={{ fontSize: 14, color: '#e4e4e7', lineHeight: 22 }}>{r.reasoning}</ThemedText>
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText style={{ color: '#c084fc', marginBottom: 5, fontSize: 16 }}>Guideline Stabilization</ThemedText>
          <ThemedText style={{ color: '#e4e4e7', lineHeight: 22 }}>{g.stabilization_plan}</ThemedText>
          <ThemedText style={{ color: '#38bdf8', marginTop: 10, marginBottom: 5 }}>Medication Guidance</ThemedText>
          <ThemedText style={{ color: '#e4e4e7', lineHeight: 22 }}>{g.medication_guidance}</ThemedText>
        </View>

        {result.escalated && plan ? (
          <View style={[styles.card, { borderColor: 'rgba(244,63,94,0.5)', backgroundColor: 'rgba(244,63,94,0.05)' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <ThemedText style={{ color: '#fb7185', fontSize: 18, fontWeight: 'bold' }}>CLOUD ESCALATION</ThemedText>
            </View>
            <ThemedText style={{ color: '#fca5a5', fontStyle: 'italic', marginBottom: 15 }}>{result.escalation_reason}</ThemedText>
            <ThemedText style={{ color: '#fff' }}>"{plan.executive_summary}"</ThemedText>
            <View style={{ marginTop: 15, padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8 }}>
              <ThemedText style={{ color: '#8b5cf6', fontSize: 12 }}>Care Plan</ThemedText>
              <ThemedText style={{ color: '#d4d4d8', fontSize: 14 }}>{plan.care_plan}</ThemedText>
            </View>
          </View>
        ) : (
          <View style={[styles.card, { borderColor: 'rgba(6,182,212,0.2)', backgroundColor: 'rgba(6,182,212,0.05)' }]}>
            <ThemedText style={{ color: '#2dd4bf', fontSize: 16, fontWeight: 'bold' }}>Manageable Locally</ThemedText>
            <ThemedText style={{ color: '#a1a1aa', marginTop: 5 }}>Follow WHO guidelines. No cloud escalation required.</ThemedText>
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>MaTriX-AI Swarm</ThemedText>
        <ThemedText style={{ color: '#a1a1aa' }}>MedGemma-4B Edge Heuristics Active</ThemedText>
      </View>

      <View style={styles.stepIndicator}>
        <Text style={[styles.stepText, step >= 1 && styles.stepActive]}>Patient</Text>
        <Text style={styles.stepArrow}>→</Text>
        <Text style={[styles.stepText, step >= 2 && styles.stepActive]}>Vitals</Text>
        <Text style={styles.stepArrow}>→</Text>
        <Text style={[styles.stepText, step >= 3 && styles.stepActive]}>Symptoms</Text>
      </View>

      <View style={styles.card}>
        {step === 1 && (
          <View>
            <ThemedText style={styles.sectionTitle}>Patient Information</ThemedText>
            <TextInput style={styles.input} placeholder="Patient Name" placeholderTextColor="#888" value={name} onChangeText={setName} />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Age" keyboardType="numeric" placeholderTextColor="#888" value={age} onChangeText={setAge} />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Gestation (Wks)" keyboardType="numeric" placeholderTextColor="#888" value={ga} onChangeText={setGa} />
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <ThemedText style={styles.sectionTitle}>Vital Signs</ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput style={[styles.input, { flex: 1, fontSize: 24, paddingVertical: 20, textAlign: 'center' }]} placeholder="Sys" keyboardType="numeric" placeholderTextColor="#888" value={sys} onChangeText={setSys} />
              <Text style={{ color: '#555', fontSize: 32, marginHorizontal: 15 }}>/</Text>
              <TextInput style={[styles.input, { flex: 1, fontSize: 24, paddingVertical: 20, textAlign: 'center' }]} placeholder="Dia" keyboardType="numeric" placeholderTextColor="#888" value={dia} onChangeText={setDia} />
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <ThemedText style={styles.sectionTitle}>Presenting Symptoms</ThemedText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {SYMPTOMS.map((s) => {
                const checked = symptoms.includes(s.key);
                return (
                  <TouchableOpacity key={s.key} onPress={() => toggleSym(s.key)} style={[styles.symptomChip, checked && (s.danger ? styles.symptomDanger : styles.symptomActive)]}>
                    <Text style={{ color: checked ? '#fff' : '#a1a1aa', fontSize: 13 }}>{s.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <View style={{ flexDirection: 'row', marginTop: 30, gap: 10 }}>
          {step > 1 && (
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(s => s - 1)}>
              <Text style={{ color: '#fff' }}>Back</Text>
            </TouchableOpacity>
          )}
          {step < 3 ? (
            <TouchableOpacity style={styles.primaryButton} onPress={() => setStep(s => s + 1)}>
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.primaryButton} onPress={handleRunTriage} disabled={loading}>
              {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.primaryButtonText}>Run AI Swarm Triage</Text>}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    color: '#38bdf8', // cyan-400
    fontSize: 28,
  },
  card: {
    backgroundColor: '#0a0a0a',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  sectionTitle: {
    color: '#a78bfa', // violet-400
    marginBottom: 15,
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    color: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'center'
  },
  stepText: {
    color: '#52525b',
    fontSize: 14,
    fontWeight: 'bold'
  },
  stepActive: {
    color: '#0ea5e9',
    textShadowColor: 'rgba(14,165,233,0.5)',
    textShadowRadius: 10
  },
  stepArrow: {
    color: '#3f3f46',
    marginHorizontal: 15
  },
  symptomChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  symptomActive: {
    borderColor: '#8b5cf6',
    backgroundColor: 'rgba(139,92,246,0.2)'
  },
  symptomDanger: {
    borderColor: '#f43f5e',
    backgroundColor: 'rgba(244,63,94,0.2)'
  },
  primaryButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  primaryButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    color: '#fca5a5',
    marginTop: 15,
    textAlign: 'center',
    padding: 10,
    backgroundColor: 'rgba(244,63,94,0.1)',
    borderRadius: 8,
  }
});
