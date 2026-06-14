'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RiArrowLeftLine, RiArrowRightLine, RiCheckLine, RiUploadCloud2Line, RiEyeLine, RiEyeOffLine, RiSearchLine } from 'react-icons/ri';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useGlobalVault } from '@/components/vault/VaultProvider';
import { SecretTypeIcon } from './SecretTypeIcon';
import { SECRET_TYPE_CONFIGS, SECRET_TYPE_CONFIG_MAP } from '@/lib/secret-types';
import { SECRET_SCHEMAS } from '@/lib/validations';
import { cn } from '@/lib/utils';
import type { Secret, SecretType, CreateSecretPayload, UpdateSecretPayload } from '@/types';

interface AddSecretWizardProps {
  onSave: (payload: CreateSecretPayload | UpdateSecretPayload) => Promise<void>;
  onCancel: () => void;
  initialSecret?: Secret;
}

type WizardStep = 1 | 2 | 3;

export function AddSecretWizard({ onSave, onCancel, initialSecret }: AddSecretWizardProps) {
  const t = useTranslations();
  const { mfaEnabled } = useGlobalVault();
  const [step, setStep] = useState<WizardStep>(initialSecret ? 2 : 1);
  const [selectedType, setSelectedType] = useState<SecretType | null>(initialSecret ? initialSecret.secret_type : null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSensitive, setIsSensitive] = useState(initialSecret?.is_sensitive ?? false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    if (initialSecret) {
      return {
        name: initialSecret.name,
        ...(initialSecret.decrypted_fields || {})
      };
    }
    return {};
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100_000) {
      alert('File too large. Maximum size is 100 KB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      reset({ ...getValues(), content: text });
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const config = selectedType ? SECRET_TYPE_CONFIG_MAP[selectedType] : null;
  const schema = selectedType ? SECRET_SCHEMAS[selectedType] : null;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    getValues,
    reset,
  } = useForm<Record<string, string>>({
    resolver: schema ? zodResolver(schema as any) : undefined,
    mode: 'onBlur',
    defaultValues: formData,
  });

  const handleTypeSelect = (type: SecretType) => {
    setSelectedType(type);
    const typeConfig = SECRET_TYPE_CONFIG_MAP[type];
    const defaults: Record<string, string> = {};
    if (typeConfig) {
      typeConfig.fields.forEach(f => {
        if (f.defaultValue) defaults[f.key] = f.defaultValue;
      });
    }
    setFormData(defaults);
    reset(defaults);
  };

  const goToStep2 = () => {
    if (!selectedType) return;
    setStep(2);
  };

  const goBackToStep1 = () => {
    if (isDirty && !window.confirm(t('common.confirmDiscard') || 'Are you sure you want to go back? Unsaved changes will be lost.')) {
      return;
    }
    setStep(1);
  };

  const onStep2Submit = handleSubmit((data) => {
    setFormData(data as Record<string, string>);
    setStep(3);
  });

  const onFinalSave = async () => {
    if (!selectedType) return;
    setIsSaving(true);
    try {
      await onSave({
        secret_type: selectedType,
        name: formData.name ?? formData.title ?? selectedType,
        fields: formData,
        is_sensitive: isSensitive
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Step 1: Type selection ──────────────────────────────────
  const stepContent: Record<WizardStep, React.ReactNode> = {
    1: (
      <div className="animate-fade-in">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{t('wizard.chooseType')}</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">{t('wizard.chooseTypeDescription')}</p>
          <div className="relative">
            <RiSearchLine className="absolute ltr:left-3 rtl:right-3 top-2.5 text-muted-foreground" size={18} />
            <Input 
              placeholder={t('common.search') || 'Search...'} 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="ltr:pl-10 rtl:pr-10 bg-muted/50" 
            />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[40vh] overflow-y-auto scrollbar-thin pr-1 pb-1">
          {SECRET_TYPE_CONFIGS.filter(cfg => 
            t(cfg.labelKey as Parameters<typeof t>[0]).toLowerCase().includes(searchQuery.toLowerCase()) || 
            cfg.type.toLowerCase().includes(searchQuery.toLowerCase())
          ).map((cfg) => (
            <button
              key={cfg.type}
              type="button"
              aria-label={t(cfg.labelKey as Parameters<typeof t>[0])}
              aria-pressed={selectedType === cfg.type}
              onClick={() => handleTypeSelect(cfg.type)}
              className={cn(
                'flex flex-col items-center gap-2 p-3.5 rounded-lg border text-center',
                'transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                selectedType === cfg.type
                  ? 'border-ring bg-accent/10 text-foreground'
                  : 'border-border text-muted-foreground hover:border-ring/40 hover:text-foreground hover:bg-muted/50'
              )}
            >
              <SecretTypeIcon type={cfg.type} size={20} />
              <span className="text-xs font-medium leading-tight">
                {t(cfg.labelKey as Parameters<typeof t>[0])}
              </span>
            </button>
          ))}
        </div>
        <div className="sticky bottom-0 bg-background pt-4 pb-2 border-t mt-6 flex justify-end z-10">
          <Button
            onClick={goToStep2}
            disabled={!selectedType}
            aria-label={t('common.next')}
          >
            {t('common.next')}
            <RiArrowRightLine size={16} className="ltr:ml-1.5 rtl:mr-1.5 rtl:rotate-180" />
          </Button>
        </div>
      </div>
    ),

    // ── Step 2: Fill fields ───────────────────────────────────
    2: config ? (
      <form className="animate-fade-in" onSubmit={onStep2Submit}>
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{t('wizard.fillDetails')}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t('wizard.fillDetailsDescription')}</p>
        </div>
        <div className="space-y-4">
          {/* Secret name field (always first) */}
          <div>
            <Label htmlFor="field-name" className="text-xs uppercase tracking-wider text-muted-foreground">
              {t('fields.name')}
            </Label>
            <Input
              id="field-name"
              placeholder={t('wizard.secretNamePlaceholder')}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'field-name-error' : undefined}
              className="mt-1.5"
              {...register('name')}
            />
            {errors.name && (
              <p id="field-name-error" className="text-xs text-destructive mt-1">
                {t(errors.name.message as Parameters<typeof t>[0])}
              </p>
            )}
          </div>

          {config.fields.map((field) => {
            const fieldError = errors[field.key];
            const inputId = `field-${field.key}`;
            const errorId = `${inputId}-error`;

            return (
              <div key={field.key}>
                <div className="flex items-center justify-between">
                  <Label htmlFor={inputId} className="text-xs uppercase tracking-wider text-muted-foreground">
                    {t(field.labelKey as Parameters<typeof t>[0])}
                    {field.required && <span className="text-destructive ltr:ml-0.5 rtl:mr-0.5">*</span>}
                  </Label>
                  {selectedType === 'env_variable' && field.key === 'content' && (
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".env,text/plain"
                        onChange={handleFileUpload}
                      />
                      {uploadSuccess ? (
                        <span className="text-xs flex items-center gap-1 text-vault-unlocked font-medium">
                          <RiCheckLine size={14} /> Imported successfully!
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs flex items-center gap-1 text-primary hover:underline font-medium"
                        >
                          <RiUploadCloud2Line size={14} />
                          {t('wizard.importFile')}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {field.type === 'textarea' ? (
                  <Textarea
                    id={inputId}
                    placeholder={field.placeholder}
                    rows={3}
                    aria-invalid={!!fieldError}
                    aria-describedby={fieldError ? errorId : undefined}
                    className={cn('mt-1.5', field.monospace && 'font-mono text-sm')}
                    {...register(field.key)}
                  />
                ) : field.type === 'select' && field.selectOptions ? (
                  <Controller
                    name={field.key}
                    control={control}
                    render={({ field: rhfField }) => (
                      <Select
                        onValueChange={rhfField.onChange}
                        value={rhfField.value ?? ''}
                      >
                        <SelectTrigger
                          id={inputId}
                          className="mt-1.5"
                          aria-invalid={!!fieldError}
                        >
                          <SelectValue placeholder="Select…" />
                        </SelectTrigger>
                        <SelectContent>
                          {field.selectOptions!.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {t(opt.labelKey as Parameters<typeof t>[0])}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : (
                  <Input
                    id={inputId}
                    type={field.type === 'password' ? 'text' : field.type}
                    placeholder={field.placeholder}
                    aria-invalid={!!fieldError}
                    aria-describedby={fieldError ? errorId : undefined}
                    className={cn('mt-1.5', field.monospace && 'font-mono text-sm')}
                    {...register(field.key)}
                  />
                )}

                {fieldError && (
                  <p id={errorId} className="text-xs text-destructive mt-1">
                    {t(fieldError.message as Parameters<typeof t>[0])}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Sensitive Toggle */}
        <div className="flex flex-col gap-3 mt-6 p-4 rounded-lg border bg-card">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Sensitive Secret</Label>
              <p className="text-xs text-muted-foreground">Require extra authentication to view the payload.</p>
            </div>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Switch
                    checked={isSensitive}
                    onCheckedChange={setIsSensitive}
                  />
                }
              />
              <TooltipContent side="bottom" align="center">
                <p className="text-xs font-medium">Toggle sensitive mode</p>
              </TooltipContent>
            </Tooltip>
          </div>
          {isSensitive && !mfaEnabled && (
            <div className="text-xs font-medium text-amber-500 bg-amber-500/10 p-2.5 rounded border border-amber-500/20">
              We highly recommend enabling Multi-Factor Authentication (MFA) in your account settings to fully protect sensitive secrets.
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-background pt-4 pb-2 border-t mt-6 flex items-center justify-between z-10">
          <Button
            type="button"
            variant="outline"
            onClick={() => initialSecret ? onCancel() : goBackToStep1()}
            aria-label={t('common.back')}
          >
            <RiArrowLeftLine size={16} className="ltr:mr-1.5 rtl:ml-1.5 rtl:rotate-180" />
            {t('common.back')}
          </Button>
          <Button type="submit" aria-label={t('common.next')}>
            {t('common.next')}
            <RiArrowRightLine size={16} className="ltr:ml-1.5 rtl:mr-1.5 rtl:rotate-180" />
          </Button>
        </div>
      </form>
    ) : null,

    // ── Step 3: Confirm ───────────────────────────────────────
    3: (
      <div className="animate-fade-in">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{t('wizard.confirmSave')}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t('wizard.confirmSaveDescription')}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowSecrets(!showSecrets)} className="text-muted-foreground">
            {showSecrets ? <><RiEyeOffLine className="ltr:mr-2 rtl:ml-2" /> Hide</> : <><RiEyeLine className="ltr:mr-2 rtl:ml-2" /> Show values</>}
          </Button>
        </div>
        <div className="bg-muted rounded-lg p-4 space-y-3">
          {Object.entries(formData)
            .filter(([, v]) => v)
            .map(([key, value]) => (
              <div key={key} className="flex items-start gap-2">
                <span className="text-xs uppercase tracking-wider text-muted-foreground w-28 shrink-0 pt-0.5">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="text-sm font-mono break-all flex-1 text-muted-foreground">
                  {showSecrets ? value : '••••••••'}
                </span>
              </div>
            ))}
        </div>
        <div className="sticky bottom-0 bg-background pt-4 pb-2 border-t mt-6 flex items-center justify-between z-10">
          <Button variant="outline" onClick={() => setStep(2)} aria-label={t('common.back')}>
            <RiArrowLeftLine size={16} className="ltr:mr-1.5 rtl:ml-1.5 rtl:rotate-180" />
            {t('common.back')}
          </Button>
          <Button
            onClick={onFinalSave}
            disabled={isSaving}
            aria-label={t('common.save')}
          >
            {isSaving ? (
              t('wizard.saving')
            ) : (
              <>
                <RiCheckLine size={16} className="ltr:mr-1.5 rtl:ml-1.5" />
                {t('common.save')}
              </>
            )}
          </Button>
        </div>
      </div>
    ),
  };

  return (
    <div>
      {/* Step counter */}
      <p className="text-xs text-muted-foreground mb-6">
        {t('common.stepOf', { step, total: 3 })}
      </p>
      {stepContent[step]}
    </div>
  );
}
