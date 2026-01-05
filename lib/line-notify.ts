/**
 * LINE Notify Integration
 * Sends notifications via LINE Notify API
 * Requires LINE_NOTIFY_TOKEN in environment variables
 */

interface LineNotifyOptions {
  message: string;
  imageThumbnail?: string;
  imageFullsize?: string;
  stickerPackageId?: number;
  stickerId?: number;
}

export async function sendLineNotify(options: LineNotifyOptions): Promise<boolean> {
  const token = process.env.LINE_NOTIFY_TOKEN;

  if (!token) {
    console.warn('LINE_NOTIFY_TOKEN is not set. Skipping LINE notification.');
    return false;
  }

  try {
    const formData = new URLSearchParams();
    formData.append('message', options.message);

    if (options.imageThumbnail) {
      formData.append('imageThumbnail', options.imageThumbnail);
    }
    if (options.imageFullsize) {
      formData.append('imageFullsize', options.imageFullsize);
    }
    if (options.stickerPackageId) {
      formData.append('stickerPackageId', options.stickerPackageId.toString());
    }
    if (options.stickerId) {
      formData.append('stickerId', options.stickerId.toString());
    }

    const response = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LINE Notify API error:', response.status, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending LINE notification:', error);
    return false;
  }
}

/**
 * Format low stock alert message for LINE Notify
 */
export function formatLowStockMessage(materials: Array<{
  name: string;
  unit: string;
  current_stock: number;
  min_stock_alert: number;
}>): string {
  if (materials.length === 0) {
    return '';
  }

  let message = '🚨 แจ้งเตือนสต็อกต่ำ\n\n';
  
  materials.forEach((material, index) => {
    message += `${index + 1}. ${material.name}\n`;
    message += `   คงเหลือ: ${material.current_stock} ${material.unit}\n`;
    message += `   จุดแจ้งเตือน: ${material.min_stock_alert} ${material.unit}\n\n`;
  });

  message += `กรุณาตรวจสอบและเพิ่มสต็อกโดยเร็ว`;

  return message;
}

