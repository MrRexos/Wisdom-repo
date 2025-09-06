import React from 'react';
import { View, StatusBar, SafeAreaView, Platform, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'nativewind';
import '../../languages/i18n';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';

export default function ReservationPolicyScreen() {
  const { colorScheme } = useColorScheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const titleColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const textColor = '#979797';
  const iconColor = colorScheme === 'dark' ? '#f2f2f2' : '#444343';
  const textStyle = 'mb-2 font-inter-medium';

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }} className='flex-1 bg-[#f2f2f2] dark:bg-[#272626]'>
      <StatusBar style={colorScheme == 'dark' ? 'light' : 'dark'} />
      <View className="pl-5 py-3">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeftIcon size={26} color={iconColor} strokeWidth={1.7} className="p-6" />
        </TouchableOpacity>
      </View>

      <ScrollView className="p-4">
        <Text style={{ color: titleColor }} className="text-2xl font-inter-bold mb-10">
          {t('reservation_policy')}
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
          Last updated: September 6, 2025
        </Text>

        {/* Deposit to Confirm the Booking */}
        <Text style={{ color: titleColor }} className="text-xl font-inter-semibold mt-4 mb-2">
          Deposit to Confirm the Booking
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          All bookings in <Text className="font-inter-semibold">Wisdom</Text> require the payment of an initial <Text className="font-inter-semibold">deposit</Text> in order to be confirmed and to guarantee the quality of the service. This deposit corresponds to approximately <Text className="font-inter-semibold">10% of the service price</Text>, with a minimum of €1. The deposit is charged at the time of booking and serves to secure the appointment and cover the platform’s commission. <Text className="font-inter-semibold">Only during the beta and gamma testing phases has the deposit been waived</Text>, but under normal conditions this advance payment is always required to guarantee commitment from both client and professional.
        </Text>

        {/* Types of Service Pricing */}
        <Text style={{ color: titleColor }} className="text-xl font-inter-semibold mt-6 mb-2">
          Types of Service Pricing
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          Wisdom offers different pricing models for services, which affect how costs and deposits are calculated:
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
          • <Text className="font-inter-semibold">Fixed price:</Text> In this model, the professional sets a fixed price visible from the start regardless of duration or conditions (shown as “Fixed Price” in the app), allowing the client to clearly know the total cost before booking. Upon confirmation, the client pays a deposit equal to 10% of the base price, which covers the Wisdom quality guarantee. The <Text className="font-inter-semibold">remaining amount is charged automatically at the end of the service and transferred in full to the professional</Text>.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          • <Text className="font-inter-semibold">Hourly rate:</Text> This model applies a fee based on time (e.g., €20/hour, shown as “/hour” in the app), where the final cost depends on the actual duration of the service. If the client provides an <Text className="font-inter-semibold">estimated duration</Text> when booking, the app will calculate a provisional price and charge a deposit equal to 10% of that amount (minimum €1). If no duration is specified (open booking), a minimum deposit of €1 will still be charged, and both the final payment and Wisdom’s commission will be adjusted to the actual time delivered. If the final duration differs from the estimate, the amount will be automatically corrected: if the service is shorter, the client will be refunded the excess deposit proportionally, and the professional’s base payment will also be adjusted; if the session runs longer, the client will be charged the additional amount and the professional will receive the updated base payment.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          • <Text className="font-inter-semibold">Price to be agreed (budget):</Text> This model applies when the price is determined after consultation or diagnosis, usually once the work is completed (shown as “To Be Agreed” in the app). In these cases, the client pays only a <Text className="font-inter-semibold">symbolic €1 deposit</Text> when booking, which confirms the appointment without requiring a predefined price. Once the service is completed, the professional sets the <Text className="font-inter-semibold">final price</Text> and communicates it to the client through the app. At that point, the client is charged the agreed amount plus an additional 10% corresponding to the Wisdom quality guarantee, deducting the €1 already paid as deposit.
        </Text>

        {/* Booking and Payment Process */}
        <Text style={{ color: titleColor }} className="text-xl font-inter-semibold mt-6 mb-2">
          Booking and Payment Process
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
          1. <Text className="font-inter-semibold">Initial contact with the professional:</Text> Before submitting a booking request, and only if the professional has this option enabled, the client may communicate with them through the app’s internal chat. This communication is limited to a maximum of <Text className="font-inter-semibold">5 messages</Text>, intended exclusively to present the situation, clarify doubts, get to know the professional, or share images that help explain the service need. This limit is meant to prevent long conversations that might lead to attempts to communicate outside the platform. In addition, during these exchanges—and in all Wisdom messages—automatic detection systems block the sending of personal data such as phone numbers, email addresses, or any information enabling external contact. If a violation is detected, the professional receives a <Text className="font-inter-semibold">strike</Text>; after three strikes, they may be penalized with temporary restrictions or even partial or permanent account suspension. Once the booking is confirmed, the chat has no message limit, although the automatic blocking of personal data remains in effect.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          &nbsp;&nbsp;&nbsp;&nbsp;Alternatively, if allowed by the professional, the client may also request a <Text className="font-inter-semibold">preliminary consultation</Text>, which may be held in person, by video call, or by phone. These consultations are meant to discuss matters in more detail before committing to a booking or to resolve quick questions without scheduling a full service. The professional decides whether these consultations are free or have a fee charged in 15-minute intervals.
        </Text>

        <Text style={{ color: textColor }} className={textStyle}>
          2. <Text className="font-inter-semibold">Booking request:</Text> The client selects a service, date and time (if applicable), address (if relevant), description, and required details. Upon confirming the request in the app, the deposit is automatically charged to the provided card. This payment method will only be stored if the client expressly authorizes it; otherwise, no card data is saved and a new method will be required at final payment. At this stage, the booking status is “requested” (pending confirmation), and the professional receives the request with full details, though it is not yet considered confirmed.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          3. <Text className="font-inter-semibold">Professional acceptance:</Text> The professional can either <Text className="font-inter-semibold">accept</Text> or <Text className="font-inter-semibold">reject</Text> the booking from their panel. If rejected, the booking switches to “rejected” and is canceled (the deposit is refunded to the client in this case). If <Text className="font-inter-semibold">accepted</Text>, the booking switches to “accepted” and is confirmed in both agendas. At that point, if a start time was not set, the platform assigns the current time as the start. Both parties can use the internal chat for additional details.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          4. <Text className="font-inter-semibold">Service delivery:</Text> On the agreed date and time, the service is carried out as planned. Once the start time is reached, the app displays the booking as “in progress.” During the service, if it ends earlier than expected, the duration will be automatically adjusted in the app, reducing the price proportionally in hourly rate cases. Both the client and the professional can mark the booking as <Text className="font-inter-semibold">completed</Text> at any time during or after the service. If neither does, the system automatically marks it as “completed” shortly after the scheduled end time. Once completed, the booking officially changes to “completed” in both users’ histories. For bookings without defined duration or end time, the service must be manually marked as finished. In such cases, if the pricing is “to be agreed,” the professional must enter the final price; and if it is hourly, the professional must enter the total duration, after which the app calculates the final price automatically.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          5. <Text className="font-inter-semibold">Final payment:</Text> When a booking is marked as completed, the system automatically processes the final payment if the client has saved a payment method; in that case, the same card used for the deposit will be charged the remaining amount. If no method has been saved, the client must enter a new card and confirm the final payment manually. For fixed price or hourly services, this amount generally corresponds, unless modified, to the total price minus the deposit already paid—that is, the base price set by the professional. For “to be agreed” services, the amount charged is the price set by the professional plus the 10% Wisdom quality guarantee, deducting the €1 deposit. This ensures that, combining deposit and final payment, the client pays exactly <Text className="font-inter-semibold">100% of the agreed price</Text> and the professional receives their full share.
        </Text>

        {/* Notes */}
        <Text style={{ color: textColor }} className={textStyle}>
          <Text className="font-inter-semibold">Note:</Text> All communication between client and professional must occur exclusively through Wisdom’s internal chat. The system includes automatic detection blocking phone numbers, emails, or other personal data to prevent external contact. This measure protects both parties and ensures that all service terms remain registered within the platform. For this reason, the initial deposit also functions as a <Text className="font-inter-semibold">quality guarantee</Text>: by requiring advance payment, it discourages attempts to bypass the app and strengthens commitment to Wisdom’s usage rules.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          <Text className="font-inter-semibold">Note:</Text> Wisdom’s commission (10%) is deducted through the initial deposit. If the final price differs from the estimate at booking, the system automatically adjusts the charge to maintain this percentage: this may involve a small extra charge or, conversely, a partial deduction from the deposit in the final payment. In all cases, the client can view the updated breakdown before confirming payment.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          <Text className="font-inter-semibold">Note:</Text> Booking details—such as duration, start or end time, address, or description—may be modified before and during the service as long as both parties agree. Once the service is marked as completed, changes to the booking are no longer possible.
        </Text>

        {/* Cancellations and Refunds */}
        <Text style={{ color: titleColor }} className="text-xl font-inter-semibold mt-6 mb-2">
          Cancellations and Refunds
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          The cancellation policy aims to balance protection for both client and professional:
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          • If the <Text className="font-inter-semibold">professional rejects or cancels</Text> an already accepted booking, the client receives a full refund of the deposit (no further charges), and the booking is closed at no cost to the client. Additionally, the professional may face penalties for repeated cancellations, as we seek to protect client trust.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          • If the <Text className="font-inter-semibold">client cancels</Text> a booking <Text className="font-inter-semibold">before the professional accepts</Text>, the request is voided and the deposit is fully refunded (since the service was never confirmed). If the client cancels <Text className="font-inter-semibold">after acceptance</Text>, the deposit is <Text className="font-inter-semibold">non-refundable</Text> and serves as compensation for late cancellation. No additional charges are made after cancellation, but the client forfeits the deposit.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          • In cases of <Text className="font-inter-semibold">no-show</Text> (by the client) or last-minute cancellations, the professional is entitled to keep the deposit as compensation. Conversely, if the professional does not show up or fails to provide the service, the client may request the return of the deposit.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          • Cancellations must be managed through the app to be recorded. The canceled booking switches to “canceled” status, and both parties are notified. In the user’s history, canceled or rejected bookings are displayed as such (status “Canceled” or “Rejected”).
        </Text>

        {/* Payment Method and Security */}
        <Text style={{ color: titleColor }} className="text-xl font-inter-semibold mt-6 mb-2">
          Payment Method and Security
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          The accepted payment method in Wisdom is <Text className="font-inter-semibold">credit or debit card</Text>, processed exclusively through the Stripe platform. When making a booking, the client must enter a valid card; Stripe processes payments <Text className="font-inter-semibold">securely and encrypted</Text>, in compliance with PCI-DSS standards. By default, <Text className="font-inter-semibold">Wisdom does not store card data</Text>: it is only saved for future payments if the client expressly authorizes it when paying the deposit. If consent is given, the system can automatically charge the final payment to the same card, speeding up the process and allowing immediate completion at service end. If the client does not authorize storage, they must re-enter a card for final payment.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          If additional authentication is required (e.g., 3D Secure verification), the app will prompt and guide the client to authorize the transaction. Only once the payment succeeds is the booking considered confirmed or completed, depending on the stage. If a payment error occurs (deposit or final charge), the app displays a <Text className="font-inter-semibold">payment error</Text> warning and the booking does not progress until resolved.
        </Text>

        {/* Legal Aspects and Invoicing */}
        <Text style={{ color: titleColor }} className="text-xl font-inter-semibold mt-6 mb-2">
          Legal Aspects and Invoicing
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          Wisdom acts solely as an <Text className="font-inter-semibold">intermediary platform</Text> between clients and professionals, facilitating booking, payment, and traceability of each service. When making a booking, the client pays Wisdom the <Text className="font-inter-semibold">deposit or quality guarantee equal to 10% of the service price (VAT included)</Text>, considered a non-refundable down payment except in the cancellation cases provided by this policy. For this, Wisdom automatically issues the client its own <Text className="font-inter-semibold">invoice</Text> for “intermediation services” at the time of booking, complying with fiscal obligations.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          The professional, meanwhile, is the <Text className="font-inter-semibold">sole party responsible for their own legal and tax obligations</Text>, including correctly issuing invoices to the client for the service rendered. Wisdom assumes no responsibility for this part. However, if the professional wishes, they may enable the <Text className="font-inter-semibold">third-party invoicing</Text> option in the app, provided they can legally issue invoices. In that case, Wisdom will automatically generate the invoice upon final payment and issue it on their behalf, under the professional’s express consent, delivering it directly to the client. If this option is not enabled, Wisdom will only provide the professional with the client’s email so they can manage invoicing independently.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          All prices shown to the end consumer in the app include VAT. Cancellation and refund policies are communicated transparently, and every milestone in the process—from booking to service completion—is supported by the corresponding invoice and by the traceability of payments processed through Stripe.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          Consequently, Wisdom guarantees the <Text className="font-inter-semibold">legality and security of its own intermediation</Text>, but in no case assumes the professional’s fiscal or contractual responsibilities related to the service provided to the client.
        </Text>

        <Text style={{ color: textColor }} className="mb-2 font-inter-medium mt-15">
          Wisdom offers a booking system designed to be <Text className="font-inter-semibold">clear, secure, and balanced</Text>. Each process follows the same flow: the <Text className="font-inter-semibold">initial deposit payment</Text> as a guarantee of commitment and quality, the <Text className="font-inter-semibold">service delivered on the agreed date and terms</Text>, and the <Text className="font-inter-semibold">automated final payment</Text> upon completion, all managed with maximum security through Stripe.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          This model ensures not only that the client <Text className="font-inter-semibold">only pays for the service actually received</Text>, but also that the professional has peace of mind with a <Text className="font-inter-semibold">guaranteed and transparent payment</Text>, backed by the platform’s traceability. Added to this is the protection of the internal messaging system, which limits attempts at external communication and preserves trust in every interaction.
        </Text>
        <Text style={{ color: textColor }} className={textStyle}>
          In short, Wisdom ensures that every booking takes place under a framework of <Text className="font-inter-semibold">professionalism, trust, and security</Text>, providing a fair and frictionless experience both for those requesting a service and for those delivering it.
        </Text>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
