<?php
declare(strict_types=1);

final class Activity
{
    public static function status(): array
    {
        $activity = abbConfig()['activity'];
        if ($activity['starts_at'] === '' || $activity['ends_at'] === '') {
            return ['code' => 'configuration_required', 'open' => false];
        }
        try {
            $now = new DateTimeImmutable('now');
            $startsAt = new DateTimeImmutable($activity['starts_at']);
            $endsAt = new DateTimeImmutable($activity['ends_at']);
        } catch (Throwable $error) {
            return ['code' => 'configuration_invalid', 'open' => false];
        }
        if ($endsAt <= $startsAt) {
            return ['code' => 'configuration_invalid', 'open' => false];
        }
        if ($now < $startsAt) {
            return ['code' => 'not_started', 'open' => false, 'startsAt' => $startsAt->format(DATE_ATOM)];
        }
        if ($now > $endsAt) {
            return ['code' => 'ended', 'open' => false, 'endsAt' => $endsAt->format(DATE_ATOM)];
        }
        return ['code' => 'open', 'open' => true, 'endsAt' => $endsAt->format(DATE_ATOM)];
    }

    public static function requireOpen(): void
    {
        $status = self::status();
        if (!$status['open']) {
            Api::error('activity_' . $status['code'], '当前不在活动开放时间内。', 403);
        }
    }
}
