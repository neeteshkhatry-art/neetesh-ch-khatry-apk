// Transaction model with integer paise precision
class TransactionModel {
  final String id;
  final String type; // income, expense, transfer
  final int amountPaise; // 1 INR = 100 paise
  final String date;
  final String category;
  final String? subcategory;
  final String paymentMethod;
  final String accountId;
  final String? toAccountId;
  final String description;
  final String? receiptPath;
  final String? recurring;

  TransactionModel({
    required this.id,
    required this.type,
    required this.amountPaise,
    required this.date,
    required this.category,
    this.subcategory,
    required this.paymentMethod,
    required this.accountId,
    this.toAccountId,
    required this.description,
    this.receiptPath,
    this.recurring,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'type': type,
      'amount_paise': amountPaise,
      'date': date,
      'category': category,
      'subcategory': subcategory,
      'payment_method': paymentMethod,
      'account_id': accountId,
      'to_account_id': toAccountId,
      'description': description,
      'receipt_path': receiptPath,
      'recurring': recurring,
    };
  }

  factory TransactionModel.fromMap(Map<String, dynamic> map) {
    return TransactionModel(
      id: map['id'],
      type: map['type'],
      amountPaise: map['amount_paise'],
      date: map['date'],
      category: map['category'],
      subcategory: map['subcategory'],
      paymentMethod: map['payment_method'],
      accountId: map['account_id'],
      toAccountId: map['to_account_id'],
      description: map['description'] ?? '',
      receiptPath: map['receipt_path'],
      recurring: map['recurring'],
    );
  }
}
