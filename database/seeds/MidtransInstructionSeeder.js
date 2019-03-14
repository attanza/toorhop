"use strict"

const PaymentInstruction = use("App/Models/PaymentInstruction")
class MidtransInstructionSeeder {
  async run() {
    await PaymentInstruction.truncate()
    const instructions = [
      {
        midtrans_payment_id: 4,
        name: "Permata Virtual Account",
        content:
          "<ol><li>On the main menu, choose <strong>Other Transaction.</strong></li><li>Choose <strong>Payment</strong>.</li><li>Choose&nbsp;<strong>Other Payment</strong>.</li><li>Choose <strong>Virtual Account</strong>.</li><li>Enter 16 digits Account No. and press <strong>Correct</strong>.</li><li>Amount to be paid, account number, and merchant name will appear on the payment confirmation page. If the information is right, press <strong>Correct</strong>.</li><li>Choose your payment account and press <strong>Correct</strong>.</li></ol>"
      },
      {
        midtrans_payment_id: 3,
        name: "ATM BCA",
        content:
          "<ol><li>On the main menu, choose&nbsp;<strong>Other Transaction</strong>.</li><li>Choose&nbsp;<strong>Transfer</strong>.</li><li>Choose&nbsp;<strong>Transfer To BCA Virtual Account</strong>.</li><li>Enter your&nbsp;<strong>Payment Code</strong>&nbsp;(11 digits code) and press&nbsp;<strong>Correct.</strong></li><li>Enter the full amount to be paid and press&nbsp;<strong>Correct.</strong></li><li>Your payment details will appear on the payment confirmation page. If the information is correct press<strong>&nbsp;Yes.</strong></li></ol>"
      },
      {
        midtrans_payment_id: 3,
        name: "Klik BCA",
        content:
          "<ol><li>Choose Menu&nbsp;<strong>Fund Transfer.</strong></li><li>Choose&nbsp;<strong>Transfer To BCA Virtual Account.</strong></li><li><strong>Input BCA Virtual Account Number&nbsp;or&nbsp;Choose from Transfer list&nbsp;</strong>and click<strong>&nbsp;Continue.</strong></li><li>Amount to be paid, account number and Merchant name will appear on the payment confirmation page, if the information is right click<strong>&nbsp;Continue.</strong></li><li>Get your&nbsp;<strong>BCA token&nbsp;</strong>and input KEYBCA Response<strong>&nbsp;APPLI 1&nbsp;</strong>and click<strong>&nbsp;Submit.</strong></li><li>Your Transaction is Done.</li></ol>"
      },
      {
        midtrans_payment_id: 3,
        name: "m-BCA",
        content:
          "<ol><li>Log in to your&nbsp;<strong>BCA Mobile</strong>&nbsp;app.</li><li>Choose&nbsp;<strong>m-BCA</strong>, then input your&nbsp;<strong>m-BCA access code.</strong></li><li>Choose&nbsp;<strong>m-Transfer</strong>, then choose BCA Virtual Account.</li><li>Input&nbsp;<strong>Virtual Account Number</strong>&nbsp;or choose an existing account from&nbsp;<strong>Daftar Transfer.</strong></li><li>Input the&nbsp;<strong>payable amount.</strong></li><li>Input your&nbsp;<strong>m-BCA pin.</strong></li><li>Payment is finished. Save the notification as your payment receipt.</li></ol>"
      },
      {
        midtrans_payment_id: 2,
        name: "ATM Mandiri",
        content:
          "<ol><li>On the main menu, choose&nbsp;<strong>Pay/Buy.</strong></li><li>Choose&nbsp;<strong>Others.</strong></li><li>Choose&nbsp;<strong>Multi Payment.</strong></li><li>Enter 70012 (Midtrans company code) and press&nbsp;<strong>Correct.</strong></li><li>Enter your Payment Code and press&nbsp;<strong>Correct.</strong></li><li>Your payment details will appear on the payment confirmation page. If the information is correct press&nbsp;<strong>Yes.</strong></li></ol>"
      },
      {
        midtrans_payment_id: 2,
        name: "Internet Banking",
        content:
          "<ol><li>Login to Mandiri Internet Banking (https://ib.bankmandiri.co.id/).</li><li>From the main menu choose&nbsp;<strong>Payment</strong>, then choose&nbsp;<strong>Multi Payment.</strong></li><li>Select your account in&nbsp;<strong>From Account</strong>, then in&nbsp;<strong>Billing Name</strong>&nbsp;select&nbsp;<strong>Midtrans.</strong></li><li>Enter the&nbsp;<strong>Payment Code</strong>&nbsp;and you will receive your payment details.</li><li>Confirm your payment using your Mandiri Token.</li></ol>"
      },
      {
        midtrans_payment_id: 1,
        name: "ATM BNI",
        content:
          "<ol><li>On the main menu, choose&nbsp;<strong>Others.</strong></li><li>Choose&nbsp;<strong>Transfer.</strong></li><li>Choose&nbsp;<strong>To BNI Account.&nbsp;</strong></li><li>Enter the payment account number and press&nbsp;<strong>Yes.</strong></li><li>Enter the full amount to be paid. If the amount entered is not the same as the invoiced amount, the transaction will be declined.</li><li>Amount to be paid, account number, and merchant name will appear on the payment confirmation page. If the information is correct, press&nbsp;<strong>Yes.</strong></li><li>You are done.</li></ol>"
      },
      {
        midtrans_payment_id: 1,
        name: "Internet Banking",
        content:
          "<ol><li>Go to&nbsp;<strong>https://ibank.bni.co.id</strong>&nbsp;and then click&nbsp;<strong>Login.</strong></li><li>Continue login with your&nbsp;<strong>User ID</strong>&nbsp;and&nbsp;<strong>Password.</strong></li><li>Click&nbsp;<strong>Transfer</strong>&nbsp;and then&nbsp;<strong>Add Favorite Account</strong>and choose&nbsp;<strong>Antar Rekening BNI.</strong></li><li>Enter account name, account number, and email and then click&nbsp;<strong>Continue.</strong></li><li>Input the&nbsp;<strong>Authentification Code</strong>&nbsp;from your token and then click&nbsp;<strong>Continue.</strong></li><li>Back to main menu and select&nbsp;<strong>Transfer</strong>&nbsp;and then&nbsp;<strong>Transfer Antar Rekening BNI.</strong></li><li>Pick the account that you just created in the previous step as&nbsp;<strong>Rekening Tujuan</strong>&nbsp;and fill in the rest before clicking&nbsp;<strong>Continue.</strong></li><li>Check whether the details are correct, if they are, please input the&nbsp;<strong>Authentification Code</strong>&nbsp;and click&nbsp;<strong>Continue</strong>&nbsp;and you are done.</li></ol>"
      },
      {
        midtrans_payment_id: 1,
        name: "Mobile Banking",
        content:
          "<ol><li>Open the BNI Mobile Banking app and login.</li><li>Choose menu Transfer.</li><li>Choose menu Virtual Account Billing.</li><li>Choose the bank account you want to use.</li><li>Enter the 16 digits virtual account number.</li><li>The billing information will appear on the payment validation page.</li><li>If the information is correct, enter your password to proceed the payment.</li><li>Your transaction will be processed.</li></ol>"
      }
    ]
    await PaymentInstruction.createMany(instructions)
  }
}

module.exports = MidtransInstructionSeeder
