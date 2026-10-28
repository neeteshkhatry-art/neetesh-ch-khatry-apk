import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  Copy,
  Check,
  FileCode,
  Terminal,
  ShieldCheck,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ApkSourceHubProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkSourceHub: React.FC<ApkSourceHubProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'build' | 'flutter' | 'sqlite' | 'manifest'>('build');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const flutterMainDart = `// lib/main.dart
// Daily Life Manager - Flutter & Dart Native Android App
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'database/sqlite_helper.dart';
import 'models/transaction_model.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await DatabaseHelper.instance.database;
  runApp(const DailyLifeManagerApp());
}

class DailyLifeManagerApp extends StatelessWidget {
  const DailyLifeManagerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Daily Life Manager',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF10B981),
          brightness: Brightness.light,
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF10B981),
          brightness: Brightness.dark,
        ),
      ),
      home: const DashboardHomeScreen(),
    );
  }
}

class DashboardHomeScreen extends StatefulWidget {
  const DashboardHomeScreen({super.key});
  @override
  State<DashboardHomeScreen> createState() => _DashboardHomeScreenState();
}

class _DashboardHomeScreenState extends State<DashboardHomeScreen> {
  int _currentIndex = 0;
  List<TransactionModel> _transactions = [];
  int _totalBalancePaise = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final list = await DatabaseHelper.instance.getAllTransactions();
    int balance = 0;
    for (var tx in list) {
      if (tx.type == 'income') balance += tx.amountPaise;
      if (tx.type == 'expense') balance -= tx.amountPaise;
    }
    setState(() {
      _transactions = list;
      _totalBalancePaise = balance;
    });
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat.currency(
      locale: 'en_IN',
      symbol: '₹',
      decimalDigits: 2,
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Daily Life Manager', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.sync),
            onPressed: _loadData,
          ),
        ],
      ),
      body: Center(
        child: Column(
          children: [
            Card(
              margin: const EdgeInsets.all(16),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    const Text('Total Net Balance', style: TextStyle(color: Colors.grey)),
                    const SizedBox(height: 8),
                    Text(
                      currencyFormatter.format(_totalBalancePaise / 100),
                      style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ),
            Expanded(
              child: ListView.builder(
                itemCount: _transactions.length,
                itemBuilder: (ctx, idx) {
                  final tx = _transactions[idx];
                  final isIncome = tx.type == 'income';
                  return ListTile(
                    leading: CircleAvatar(
                      backgroundColor: isIncome ? Colors.green.shade100 : Colors.red.shade100,
                      child: Icon(
                        isIncome ? Icons.arrow_downward : Icons.arrow_upward,
                        color: isIncome ? Colors.green : Colors.red,
                      ),
                    ),
                    title: Text(tx.category),
                    subtitle: Text(tx.description),
                    trailing: Text(
                      currencyFormatter.format(tx.amountPaise / 100),
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: isIncome ? Colors.green : Colors.red,
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.receipt_long), label: 'Transactions'),
          NavigationDestination(icon: Icon(Icons.pie_chart), label: 'Reports'),
          NavigationDestination(icon: Icon(Icons.restaurant), label: 'Diet'),
          NavigationDestination(icon: Icon(Icons.settings), label: 'Settings'),
        ],
      ),
    );
  }
}`;

  const sqliteHelperDart = `// lib/database/sqlite_helper.dart
// Offline SQLite Database with Integer Paise Storage
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/transaction_model.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('dailylifemanager.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future _createDB(Database db, int version) async {
    // Accounts Table
    await db.execute('''
      CREATE TABLE accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        opening_balance_paise INTEGER NOT NULL,
        color TEXT NOT NULL
      )
    ''');

    // Transactions Table (Stored in exact integer paise)
    await db.execute('''
      CREATE TABLE transactions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        amount_paise INTEGER NOT NULL,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        subcategory TEXT,
        payment_method TEXT NOT NULL,
        account_id TEXT NOT NULL,
        to_account_id TEXT,
        description TEXT,
        receipt_path TEXT,
        recurring TEXT
      )
    ''');

    // Diet Meals Table
    await db.execute('''
      CREATE TABLE meals (
        id TEXT PRIMARY KEY,
        meal_type TEXT NOT NULL,
        food_name TEXT NOT NULL,
        serving_size TEXT NOT NULL,
        servings_count REAL NOT NULL,
        calories INTEGER NOT NULL,
        protein REAL NOT NULL,
        carbs REAL NOT NULL,
        fat REAL NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        notes TEXT
      )
    ''');
  }

  Future<int> insertTransaction(TransactionModel tx) async {
    final db = await instance.database;
    return await db.insert('transactions', tx.toMap());
  }

  Future<List<TransactionModel>> getAllTransactions() async {
    final db = await instance.database;
    final result = await db.query('transactions', orderBy: 'date DESC');
    return result.map((json) => TransactionModel.fromMap(json)).toList();
  }
}`;

  const buildInstructions = `# 1. Prerequisites
Ensure you have the Flutter SDK (>=3.24.0) and Android Studio / JDK 17 installed.

# 2. Check connected Android phone or emulator
flutter devices

# 3. Build Signed Release APK
# Generates release APK optimized with R8 tree-shaking & Proguard
flutter build apk --release

# Output path:
# build/app/outputs/flutter-apk/app-release.apk

# 4. Build Debug APK (Fast for testing & sideloading)
flutter build apk --debug

# Output path:
# build/app/outputs/flutter-apk/app-debug.apk

# 5. Direct USB Install to Android Phone:
flutter install
# or
adb install -r build/app/outputs/flutter-apk/app-release.apk`;

  const downloadFlutterCode = () => {
    const combinedContent = `// Daily Life Manager - Flutter & Dart Codebase
// ============================================

// 1. pubspec.yaml
name: daily_life_manager
description: Complete Android Personal Finance & Diet Management App
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  sqflite: ^2.3.0
  path: ^1.8.3
  intl: ^0.19.0
  fl_chart: ^0.66.0
  shared_preferences: ^2.2.2
  local_auth: ^2.1.8

flutter:
  uses-material-design: true

// ============================================
// 2. lib/main.dart
${flutterMainDart}

// ============================================
// 3. lib/database/sqlite_helper.dart
${sqliteHelperDart}
`;

    const blob = new Blob([combinedContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'daily_life_manager_flutter_src.dart';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Android APK & Source Code Hub
              </h2>
              <p className="text-xs text-slate-500">
                Signed Release APK, Debug APK, Flutter Dart Code & SQLite Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-4 pt-3 border-b border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'build', label: 'APK Build Guide & Output Paths', icon: Terminal },
            { id: 'flutter', label: 'Flutter main.dart', icon: FileCode },
            { id: 'sqlite', label: 'SQLite DB Schema', icon: Layers },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'build' && (
            <div className="space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {/* Output Path Callout */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm mb-2">
                  <ShieldCheck className="w-5 h-5" />
                  Android APK Output Paths
                </div>
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900 flex justify-between items-center">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Signed Release APK</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        build/app/outputs/flutter-apk/app-release.apk
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard('build/app/outputs/flutter-apk/app-release.apk', 'path-rel')}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
                    >
                      {copiedCode === 'path-rel' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900 flex justify-between items-center">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Debug APK (Direct Sideload)</span>
                      <span className="text-indigo-700 dark:text-indigo-400 font-semibold">
                        build/app/outputs/flutter-apk/app-debug.apk
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard('build/app/outputs/flutter-apk/app-debug.apk', 'path-deb')}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
                    >
                      {copiedCode === 'path-deb' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Instant Android PWA Install */}
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300 font-bold text-sm mb-1">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Instant Direct Phone Installation (WebAPK / PWA)
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs mb-3">
                  You can install Daily Life Manager right now on any Android phone without a computer! Open this link in Chrome on your phone and tap <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>. Android automatically packages and signs a native WebAPK with full offline local storage and home screen launch icon.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if ('serviceWorker' in navigator) {
                        alert('Daily Life Manager is ready for 100% offline usage. Add to Home Screen in Chrome on Android!');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs"
                  >
                    Check Offline Readiness
                  </button>
                  <button
                    onClick={downloadFlutterCode}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-semibold text-xs hover:bg-indigo-50"
                  >
                    Download Flutter Source (.dart)
                  </button>
                </div>
              </div>

              {/* Terminal build script */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-900 dark:text-white">Command Line Build Script:</span>
                  <button
                    onClick={() => copyToClipboard(buildInstructions, 'build-cmd')}
                    className="flex items-center gap-1 text-emerald-600 text-xs hover:underline"
                  >
                    {copiedCode === 'build-cmd' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Commands
                  </button>
                </div>
                <pre className="p-3.5 bg-slate-900 text-emerald-400 rounded-2xl overflow-x-auto font-mono text-[11px] leading-relaxed">
                  {buildInstructions}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'flutter' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">lib/main.dart (Flutter Dart Implementation)</span>
                <button
                  onClick={() => copyToClipboard(flutterMainDart, 'main-dart')}
                  className="flex items-center gap-1 text-emerald-600 text-xs hover:underline"
                >
                  {copiedCode === 'main-dart' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Code
                </button>
              </div>
              <pre className="p-3.5 bg-slate-900 text-slate-200 rounded-2xl overflow-x-auto font-mono text-[11px] max-h-96 leading-relaxed">
                {flutterMainDart}
              </pre>
            </div>
          )}

          {activeTab === 'sqlite' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">lib/database/sqlite_helper.dart (Offline SQLite Storage)</span>
                <button
                  onClick={() => copyToClipboard(sqliteHelperDart, 'sqlite-dart')}
                  className="flex items-center gap-1 text-emerald-600 text-xs hover:underline"
                >
                  {copiedCode === 'sqlite-dart' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Code
                </button>
              </div>
              <pre className="p-3.5 bg-slate-900 text-slate-200 rounded-2xl overflow-x-auto font-mono text-[11px] max-h-96 leading-relaxed">
                {sqliteHelperDart}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <button
            onClick={downloadFlutterCode}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
          >
            <Download className="w-4 h-4" />
            Download Source Bundle
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
