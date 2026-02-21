import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const PARTNERS = {
  Adil: {
    email: 'adil143420@gmail.com',
    phone: '8904473364',
  },
  Aejaz: {
    email: 'aejazfishkcp@gmail.com',
    phone: '9449794801',
  },
};

interface ExpenseNotification {
  action: 'created' | 'updated' | 'deleted';
  actor: 'Adil' | 'Aejaz';
  expense: {
    id: string;
    amount: number;
    description: string;
    expense_date: string;
    owner_name: string;
  };
  changes?: {
    field: string;
    oldValue: string | number;
    newValue: string | number;
  }[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, actor, expense, changes } = (await req.json()) as ExpenseNotification;

    // Determine recipient (notify the OTHER partner)
    const recipient = actor === 'Adil' ? PARTNERS.Aejaz : PARTNERS.Adil;
    const actorName = actor;

    // Build email content
    let subject = '';
    let htmlContent = '';
    const appUrl = 'https://adifa-fisheries.vercel.app'; // Update with your actual URL

    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(amount);

    const formatDate = (date: string) =>
      new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

    if (action === 'created') {
      subject = `🐟 New Expense Added by ${actorName}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981;">New Expense Added</h2>
          <p><strong>${actorName}</strong> added a new expense:</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Amount:</strong> ${formatCurrency(expense.amount)}</p>
            <p><strong>Description:</strong> ${expense.description || 'No description'}</p>
            <p><strong>Date:</strong> ${formatDate(expense.expense_date)}</p>
          </div>
          <a href="${appUrl}/expenses" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 10px;">View Expenses</a>
        </div>
      `;
    } else if (action === 'updated') {
      subject = `🐟 Expense Updated by ${actorName}`;
      const changesHtml = changes
        ?.map(
          (c) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${c.field}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #ef4444;">${c.oldValue}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #10b981;">${c.newValue}</td>
          </tr>
        `
        )
        .join('');

      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #f59e0b;">Expense Updated</h2>
          <p><strong>${actorName}</strong> updated an expense:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 8px; text-align: left;">Field</th>
                <th style="padding: 8px; text-align: left;">Old Value</th>
                <th style="padding: 8px; text-align: left;">New Value</th>
              </tr>
            </thead>
            <tbody>
              ${changesHtml}
            </tbody>
          </table>
          <a href="${appUrl}/expenses" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 10px;">View Expenses</a>
        </div>
      `;
    } else if (action === 'deleted') {
      subject = `🐟 Expense Deleted by ${actorName}`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #ef4444;">Expense Deleted</h2>
          <p><strong>${actorName}</strong> deleted an expense:</p>
          <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ef4444;">
            <p><strong>Amount:</strong> ${formatCurrency(expense.amount)}</p>
            <p><strong>Description:</strong> ${expense.description || 'No description'}</p>
            <p><strong>Date:</strong> ${formatDate(expense.expense_date)}</p>
          </div>
          <a href="${appUrl}/expenses" style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 10px;">View Expenses</a>
        </div>
      `;
    }

    // Send email via Resend
    if (RESEND_API_KEY) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Adifa Fisheries <notifications@adifa-fisheries.com>',
          to: [recipient.email],
          subject,
          html: htmlContent,
        }),
      });

      if (!emailResponse.ok) {
        const error = await emailResponse.text();
        console.error('Email send failed:', error);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
