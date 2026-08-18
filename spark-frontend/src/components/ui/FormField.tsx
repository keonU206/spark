import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import type { TextInputProps } from 'react-native';

import { TextField } from '@/components/ui/TextField';

/**
 * react-hook-form과 `TextField`를 잇는 어댑터.
 * 화면마다 `Controller` 보일러플레이트를 반복하지 않기 위한 것이다.
 */
type Props<T extends FieldValues> = TextInputProps & {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  containerStyle?: React.ComponentProps<typeof TextField>['containerStyle'];
  icon?: React.ReactNode;
  height?: number;
  /** 입력값을 저장 전에 다듬는다 (공백 제거, 길이 자르기 등) */
  transform?: (value: string) => string;
};

export function FormField<T extends FieldValues>({
  control,
  name,
  transform,
  ...rest
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          {...rest}
          value={field.value ?? ''}
          onChangeText={(text) => field.onChange(transform ? transform(text) : text)}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
