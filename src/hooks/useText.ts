import { useMemo } from 'react';
import { TEXT_CONSTANTS, getText, t } from '../lib/constants/text';

/**
 * Custom hook for accessing text constants
 * Provides easy access to centralized text with TypeScript support
 */
export function useText() {
  return useMemo(() => ({
    // Direct access to text constants
    constants: TEXT_CONSTANTS,
    
    // Safe getter function
    get: getText,
    
    // Shortcut functions
    t,
    
    // Commonly used text getters
    common: {
      loading: () => getText('common.messages.loading'),
      success: () => getText('common.messages.success'),
      error: () => getText('common.messages.error'),
      confirm: () => getText('common.messages.confirm'),
      required: () => getText('common.messages.required'),
    },
    
    // Game specific getters
    game: {
      title: (isEditing: boolean) => isEditing ? t.game.edit() : t.game.create(),
      button: (isEditing: boolean) => isEditing ? t.game.update() : t.game.record(),
      section: {
        basicInfo: () => ({
          title: getText('game.form.sections.basicInfo.title'),
          description: getText('game.form.sections.basicInfo.description')
        }),
        costs: () => ({
          title: getText('game.form.sections.costs.title'), 
          description: getText('game.form.sections.costs.description')
        }),
        members: () => ({
          title: getText('game.form.sections.members.title'),
          description: getText('game.form.sections.members.description')
        }),
      },
      validation: {
        dateRequired: () => getText('game.validation.dateRequired'),
        dateFuture: () => getText('game.validation.dateFuture'),
        dateTooOld: () => getText('game.validation.dateTooOld'),
        locationRequired: () => getText('game.validation.locationRequired'),
        locationTooShort: () => getText('game.validation.locationTooShort'),
        yardCostNegative: () => getText('game.validation.yardCostNegative'),
        yardCostTooHigh: () => getText('game.validation.yardCostTooHigh'),
        shuttleCockQuantityNegative: () => getText('game.validation.shuttleCockQuantityNegative'),
        shuttleCockQuantityTooHigh: () => getText('game.validation.shuttleCockQuantityTooHigh'),
        shuttlePriceNegative: () => getText('game.validation.shuttlePriceNegative'),
        shuttlePriceTooHigh: () => getText('game.validation.shuttlePriceTooHigh'),
        otherFeesRequired: () => getText('game.validation.otherFeesRequired'),
        otherFeesTooHigh: () => getText('game.validation.otherFeesTooHigh'),
        tooManyMembers: () => getText('game.validation.tooManyMembers'),
        noMembersSelected: () => getText('game.validation.noMembersSelected'),
        totalCostInvalid: () => getText('game.validation.totalCostInvalid'),
      },
      messages: {
        createSuccess: () => getText('game.messages.createSuccess'),
        updateSuccess: () => getText('game.messages.updateSuccess'),
        validationSummary: () => getText('game.messages.validationSummary'),
        goToFirstError: () => getText('game.messages.goToFirstError'),
      }
    },

    // Member specific getters  
    member: {
      title: () => getText('member.titles.memberManagement'),
      list: () => getText('member.titles.memberList'),
    },

    // Payment specific getters
    payment: {
      insufficientAmount: () => getText('payment.messages.insufficientAmount'),
      noPaymentRequired: () => getText('payment.messages.noPaymentRequired'),
    },

    // Form field labels
    field: {
      gameDate: () => getText('game.form.labels.gameDate'),
      gameLocation: () => getText('game.form.labels.gameLocation'),
      yardCost: () => getText('game.form.labels.yardCost'),
      shuttleCockCost: () => getText('game.form.labels.shuttleCockCost'),
      shuttleCockQuantity: () => getText('game.form.labels.shuttleCockQuantity'),
      otherFees: () => getText('game.form.labels.otherFees'),
      participants: () => getText('game.form.labels.participants'),
    },

    // Placeholders
    placeholder: {
      alternativeLocation: () => getText('game.form.placeholders.alternativeLocation'),
      searchMembers: () => getText('game.form.placeholders.searchMembers'),
    }
  }), []);
}