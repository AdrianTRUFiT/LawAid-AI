import { LawAidAIWorkspace } from './casePathContracts';
import { ConversionPromptViewModel } from './shellViewContracts';
import { classifyConversionMoment } from './conversionMoment';

export function buildConversionPromptViewModel(workspace: LawAidAIWorkspace): ConversionPromptViewModel {
  const conversion = classifyConversionMoment(workspace);

  return {
    show: conversion.show,
    message: conversion.message,
    reason: conversion.reason,
    moment: conversion.moment
  };
}
